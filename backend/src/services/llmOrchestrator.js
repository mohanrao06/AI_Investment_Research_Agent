import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs/promises'
import path from 'path'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { fetchNews, resolveTicker, fetchComprehensiveFinancials } from './dataFetchers.js'

const TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.2)

// -------- Gemini models and usage tracker (free‑tier quota, PT‑aligned, multi-model) --------
const USAGE_FILE = path.join(process.cwd(), 'gemini_usage.json')
const DAILY_LIMIT = 60 // free‑tier limit per model

// Available Gemini models to rotate through - each has its own quota
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
]

/**
 * Returns the current date in America/Los_Angeles (Pacific Time) as YYYY-MM-DD.
 * This matches the daily reset boundary used by Google’s free‑tier quotas.
 */
function getPtDateString() {
  // Using toLocaleString with timeZone avoids needing external libraries.
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}

/**
 * Reads the usage file, returns the usage object for today.
 * Format: { date: 'YYYY-MM-DD', models: { 'model-name': count, ... } }
 */
async function getUsageData() {
  let data = { date: '', models: {} }
  try {
    const raw = await fs.readFile(USAGE_FILE, 'utf8')
    data = JSON.parse(raw)
  } catch (_) {
    // file doesn't exist or is invalid – start fresh
  }

  const todayPt = getPtDateString()
  if (data.date !== todayPt) {
    // new PT day – reset counters
    data = { date: todayPt, models: {} }
    GEMINI_MODELS.forEach(model => {
      data.models[model] = 0
    })
  }

  return data
}

/**
 * Increment usage for the given model and persist.
 */
async function incrementModelUsage(modelName) {
  const data = await getUsageData()
  data.models[modelName] = (data.models[modelName] || 0) + 1
  await fs.writeFile(USAGE_FILE, JSON.stringify(data), 'utf8')
}

/**
 * Check if any Gemini model still has free‑tier quota left today.
 */
async function canUseGemini() {
  const data = await getUsageData()
  return GEMINI_MODELS.some((m) => (data.models[m] || 0) < DAILY_LIMIT)
}

/**
 * Pick the model with the lowest usage that still has quota left.
 * Returns null when every model is exhausted.
 */
async function pickModelWithQuota() {
  const data = await getUsageData()
  let best = null
  let lowest = Infinity
  for (const model of GEMINI_MODELS) {
    const count = data.models[model] || 0
    if (count < DAILY_LIMIT && count < lowest) {
      best = model
      lowest = count
    }
  }
  return best
}

// -------- Simple in‑memory cache to avoid duplicate calls --------
const CACHE = new Map() // key -> { timestamp: number, result: any }
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

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

// -------- Gemini model helper --------
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

/**
 * Simple sleep helper (ms)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Invoke Gemini with multi-model rotation, exponential backoff on 429, and
 * automatic failover to the next model when one hits its quota.
 * Uses `pickModelWithQuota` so each request goes to the model with the lowest
 * usage that still has free‑tier capacity left (≈5 × 20 = 100 req/day total).
 */
async function invokeWithFallback(prompt) {
  if (!(await canUseGemini())) {
    const err = new Error(
      `All Gemini models at quota for today (${DAILY_LIMIT * GEMINI_MODELS.length} requests).`
    )
    err.quotaExhausted = true
    throw err
  }

  const maxRetries = 4
  let attempt = 0
  let delayMs = 1000
  let triedModels = new Set()

  while (attempt <= maxRetries) {
    const modelName = await pickModelWithQuota()
    if (!modelName || triedModels.has(modelName)) {
      // No fresh model with quota available — bail.
      const err = new Error('No Gemini model with remaining quota.')
      err.quotaExhausted = true
      throw err
    }
    triedModels.add(modelName)

    try {
      const model = createGeminiModel(modelName)
      const response = await model.invoke(prompt)
      await incrementModelUsage(modelName)
      return { response, providerLog: { provider: 'Gemini', model: modelName } }
    } catch (error) {
      const errorMsg = error?.message || ''

      // Detect quota‑exhaustion from the API (429 with retry delay)
      const isQuotaError =
        errorMsg.includes('429') &&
        (errorMsg.includes('quota') || errorMsg.includes('Quota'))

      if (isQuotaError) {
        // Mark this model as exhausted for today and move to the next one.
        await incrementModelUsage(modelName)
        console.warn(
          `Gemini ${modelName} hit 429 quota – rotating to next available model (attempt ${attempt + 1}).`
        )
        attempt++
        continue
      }

      if (attempt < maxRetries) {
        const match = errorMsg.match(/Please\s+retry\s+in\s+([0-9.]+)s/i)
        let suggestedDelay = 0
        if (match) {
          const seconds = parseFloat(match[1])
          suggestedDelay = Math.floor(seconds * 1000)
        }
        delayMs = Math.max(delayMs, suggestedDelay)
        console.warn(
          `Gemini ${modelName} transient error (attempt ${attempt + 1}/${maxRetries + 1}): ${errorMsg}. ` +
            `Waiting ${delayMs}ms before retry…`
        )
        await sleep(delayMs)
        delayMs = Math.min(delayMs * 2, 30000)
        attempt++
        continue
      }

      console.warn(`Gemini invoke failed:`, errorMsg)
      throw error
    }
  }
}

// -------- Prompt & parsing (unchanged) --------
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

/**
 * Format financial data for better readability in the prompt.
 */
function formatFinancials(data) {
  const parts = [];
  
  // Price Information
  if (data.currentPrice) parts.push(`Current Price: ${data.currency || 'USD'} ${data.currentPrice}`);
  if (data.highPrice) parts.push(`Day High: ${data.currency || 'USD'} ${data.highPrice}`);
  if (data.lowPrice) parts.push(`Day Low: ${data.currency || 'USD'} ${data.lowPrice}`);
  if (data.openPrice) parts.push(`Open Price: ${data.currency || 'USD'} ${data.openPrice}`);
  if (data.previousClose) parts.push(`Previous Close: ${data.currency || 'USD'} ${data.previousClose}`);
  
  // 52-week range
  if (data.fiftyTwoWeekHigh || data.fiftyTwoWeekLow) {
    parts.push(`52-Week Range: ${data.currency || 'USD'} ${data.fiftyTwoWeekLow} - ${data.fiftyTwoWeekHigh}`);
  }
  
  // Volume
  if (data.volume) parts.push(`Volume: ${(data.volume / 1000000).toFixed(2)}M`);
  
  // Fundamental Metrics
  if (data.peRatio) parts.push(`P/E Ratio: ${data.peRatio.toFixed(2)}`);
  if (data.dividendYield) parts.push(`Dividend Yield: ${(data.dividendYield * 100).toFixed(2)}%`);
  if (data.eps) parts.push(`EPS: ${data.eps.toFixed(2)}`);
  if (data.marketCap) parts.push(`Market Cap: ${data.marketCap.toFixed(0)} (millions)`);
  
  // Company Info
  if (data.longName) parts.push(`Company: ${data.longName}`);
  if (data.exchange) parts.push(`Exchange: ${data.exchange}`);
  if (data.industry) parts.push(`Industry: ${data.industry}`);
  
  // Source
  if (data.source) parts.push(`Data Source: ${data.source}`);
  
  return parts.join('\n');
}

/**
 * Main exported function – called by the route handler.
 * Includes a simple cache to avoid duplicate API calls for the same company.
 */
export async function runResearch(company) {
  // 1️⃣ Check cache first
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
    // If we hit quota exhaustion we want to return a fallback instead of bubbling up.
    if (error.quotaExhausted) {
      errorMessage = `Gemini daily quota exhausted (~${DAILY_LIMIT * GEMINI_MODELS.length} requests across all models). Returning fallback.`
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

  // 2️⃣ Store in cache for future duplicate requests
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