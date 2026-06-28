import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs/promises'
import path from 'path'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { fetchNews, resolveTicker, fetchComprehensiveFinancials } from './dataFetchers.js'

const TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.2)

const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
]

function getPtDateString() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}

const CACHE = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

function getFromCache(company) {
  const entry = CACHE.get(company)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    CACHE.delete(company)
    return null
  }
  return entry.result
}

function setInCache(company, result) {
  CACHE.set(company, { timestamp: Date.now(), result })
}

function createGeminiModel(modelName) {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: modelName,
    temperature: TEMPERATURE,
  })
}

function getResponseText(response) {
  if (!response) return ''
  if (typeof response === 'string') return response
  if (typeof response.content === 'string') return response.content
  if (Array.isArray(response.content) && typeof response.content[0] === 'string')
    return response.content[0]
  if (typeof response.text === 'string') return response.text
  if (Array.isArray(response.text) && typeof response.text[0] === 'string')
    return response.text[0]
  if (response.output && Array.isArray(response.output) && response.output.length > 0) {
    const first = response.output[0]
    if (typeof first === 'string') return first
    if (first && typeof first.content === 'string') return first.content
  }
  return JSON.stringify(response)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function invokeWithFallback(prompt) {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);

      const model = createGeminiModel(modelName);
      const response = await model.invoke(prompt);

      return {
        response,
        providerLog: {
          provider: "Gemini",
          model: modelName,
        },
      };
    } catch (error) {
      const errorMsg = error?.message || "";

      console.warn(`${modelName} failed: ${errorMsg}`);

      const isQuotaError =
        errorMsg.includes("429") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.toLowerCase().includes("quota");

      if (isQuotaError) {
        console.warn(`Quota exhausted for ${modelName}. Trying next model...`);
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  const err = lastError || new Error("All Gemini models unavailable.");
  err.quotaExhausted = true;
  throw err;
}

const promptTemplate = `You are an AI investment research assistant with expertise in fundamental analysis.

Company: {company}
Ticker: {ticker}

Financial Data (includes price, fundamentals, and valuation metrics):
{financials}

Recent news:
{news}

Using the comprehensive financial data and news above, analyze the investment opportunity:
1. Evaluate valuation: Is P/E ratio reasonable for the industry and growth prospects?
2. Assess fundamentals: Check profitability (EPS, dividend yield), market cap, 52-week performance
3. Review news: Are there positive/negative catalysts or operational changes?
4. Consider risk: Evaluate company strength and market conditions

Choose one decision: INVEST or PASS.
Provide a concise, factual answer. Produce a JSON object with these keys only:
- decision
- confidence (integer 0-100)
- summary
- reasoning
- key_evidence

Example output:
{
  "decision": "INVEST",
  "confidence": 78,
  "summary": "...",
  "reasoning": ["...", "..."],
  "key_evidence": ["...", "..."]
}

Do not add extra text outside valid JSON.
`

async function parseJsonResponse(text) {
  try {
    return JSON.parse(text)
  } catch (error) {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        return null
      }
    }
    return null
  }
}

function formatFinancials(data) {
  const parts = [];

  if (data.currentPrice) parts.push(`Current Price: ${data.currency || 'USD'} ${data.currentPrice}`);
  if (data.highPrice) parts.push(`Day High: ${data.currency || 'USD'} ${data.highPrice}`);
  if (data.lowPrice) parts.push(`Day Low: ${data.currency || 'USD'} ${data.lowPrice}`);
  if (data.openPrice) parts.push(`Open Price: ${data.currency || 'USD'} ${data.openPrice}`);
  if (data.previousClose) parts.push(`Previous Close: ${data.currency || 'USD'} ${data.previousClose}`);

  if (data.fiftyTwoWeekHigh || data.fiftyTwoWeekLow) {
    parts.push(`52-Week Range: ${data.currency || 'USD'} ${data.fiftyTwoWeekLow} - ${data.fiftyTwoWeekHigh}`);
  }

  if (data.volume) parts.push(`Volume: ${(data.volume / 1000000).toFixed(2)}M`);

  if (data.peRatio) parts.push(`P/E Ratio: ${data.peRatio.toFixed(2)}`);
  if (data.dividendYield) parts.push(`Dividend Yield: ${(data.dividendYield * 100).toFixed(2)}%`);
  if (data.eps) parts.push(`EPS: ${data.eps.toFixed(2)}`);
  if (data.marketCap) parts.push(`Market Cap: ${data.marketCap.toFixed(0)} (millions)`);

  if (data.longName) parts.push(`Company: ${data.longName}`);
  if (data.exchange) parts.push(`Exchange: ${data.exchange}`);
  if (data.industry) parts.push(`Industry: ${data.industry}`);

  if (data.source) parts.push(`Data Source: ${data.source}`);

  return parts.join('\n');
}

export async function runResearch(company) {
  const cached = getFromCache(company)
  if (cached) {
    console.warn(`Returning cached result for ${company}`)
    return cached
  }

  const ticker = await resolveTicker(company)
  const financials = await fetchComprehensiveFinancials(ticker)
  const news = await fetchNews(company)

  const financialsText = formatFinancials(financials)
  const newsText = news
    .map((item, index) => `${index + 1}. ${item.source}: ${item.title} - ${item.snippet}`)
    .join('\n')

  const fullPrompt = promptTemplate
    .replace('{company}', company)
    .replace('{ticker}', ticker)
    .replace('{financials}', financialsText)
    .replace('{news}', newsText)

  let response = null
  let providerLog = { provider: null, model: null }
  let text = ''
  let parsed = null
  let errorMessage = ''

  try {
    const result = await invokeWithFallback(fullPrompt)
    response = result.response
    providerLog = result.providerLog
    text = getResponseText(response)
    parsed = await parseJsonResponse(text)
  } catch (error) {
    if (error.quotaExhausted) {
      errorMessage = `Gemini daily quota exhausted. Returning fallback.`
      console.warn(errorMessage)
    } else {
      errorMessage = error?.message || 'LLM request failed'
      console.warn('LLM request failed, returning fallback result:', errorMessage)
    }
    text = ''
  }

  const decision = parsed?.decision || 'PASS'
  const confidence = Number(parsed?.confidence ?? 50)
  const summary =
    parsed?.summary ||
    (text ? `Unable to parse model response. Raw output: ${text.slice(0, 250)}` : errorMessage || 'LLM request failed')
  const reasoning = parsed?.reasoning || ['See raw model response for details.']
  const keyEvidence = parsed?.key_evidence || []

  const resultObj = {
    decision,
    confidence,
    summary,
    evidence: news,
    reasoning,
    keyEvidence,
    transcript: {
      prompt: promptTemplate,
      input: { company, ticker, financials: financialsText, news: newsText },
      response: text,
      parsed: parsed ?? null,
      providerLog,
      error: errorMessage || null,
    },
  }

  setInCache(company, resultObj)

  if (process.env.LOG_LLM_TRANSCRIPTS === 'true') {
    const logsDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logsDir, { recursive: true }).catch(() => {})
    await fs.writeFile(
      path.join(logsDir, `${ticker || company}-${Date.now()}.json`),
      JSON.stringify(resultObj, null, 2)
    )
  }

  return resultObj
}