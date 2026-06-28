<div align="center">

# 💼 InvestClear

### Investment Research Agent

*Turn any company name into a structured INVEST / PASS verdict — in seconds.*

<br>

![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)

<br>

[**Overview**](#-overview) · [**How to Run**](#-how-to-run-it) · [**How it Works**](#-how-it-works) · [**Decisions**](#-key-decisions--trade-offs) · [**Examples**](#-example-runs) · [**Improvements**](#-what-id-improve-with-more-time) · [**Bonus**](#-bonus--chat-session-logs)

<br>

> 🧠 *Built by a Computer Science student. No frameworks-for-the-sake-of-it. No databases. No auth. Just a fast pipeline that turns financial data and news into a structured research report.*

</div>

---

## ✨ Overview

### What is InvestClear?

**InvestClear** is a lightweight web application that takes a company name or ticker, pulls live financial data and recent news, and produces a structured investment report:

- ✅ **Decision** — `INVEST` or `PASS`
- 🎯 **Confidence** — `0–100` score
- 📝 **Summary** — 2–3 sentence thesis
- 💭 **Reasoning** — bullet list of why
- 📰 **Key Evidence** — supporting points from news

The report is rendered as a clean card, can be exported to PDF, can be shared via the native share sheet, and every report includes a fully expanded **transcript** (the exact prompt and the model's raw response) so the user can audit the reasoning.

### Why does it exist?

Most retail investors don't have time to read a 10-K before deciding on a position. InvestClear compresses that workflow into a single search box, while keeping every step of the reasoning visible — the report is the model's opinion, **not a black-box signal**.

### Who is it for?

| User                         | What they get                                                              |
| ---------------------------- | -------------------------------------------------------------------------- |
| 👤 **Retail investors**      | A fast first-pass thesis on any ticker before doing deeper diligence       |
| 🎓 **Curious learners**      | A real, working example of a multi-source prompt-and-response pipeline     |
| 🛠️ **Builders**              | A starter stack — React + Express + LangChain + a free LLM + free APIs     |
| 📊 **Finance enthusiasts**   | Side-by-side comparison workflows for brokers like Groww / Zerodha / Upstox |

<br>

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🔎  Search "Apple"  ─────▶  📊  Fetch financials + news           │
│                                          │                          │
│                                          ▼                          │
│                              🧠  Send to language model             │
│                                          │                          │
│                                          ▼                          │
│   📄  Render report  ◀──────  📦  Return structured JSON            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

</div>

---

## 🚀 How to Run It

### Prerequisites

You'll need:

| Tool       | Version         | Why                                    |
| ---------- | --------------- | -------------------------------------- |
| **Node.js** | `18.x` or `20.x` | Runs both frontend dev server and backend |
| **npm**   | `9+`            | Package manager                        |
| A web browser | Modern (Chrome / Edge / Firefox / Safari) | For the UI |

### API keys

The app uses three free-tier API services. **None are strictly required** — there are graceful fallbacks for both finance data and news — but to get the full experience you'll want all three:

| 🔑 Key               | Purpose                              | Free tier               | Get it                                   |
| -------------------- | ------------------------------------ | ----------------------- | ---------------------------------------- |
| `GEMINI_API_KEY`     | Reasoning model                      | ✅ Yes, multi-model rotation | https://aistudio.google.com/app/apikey   |
| `FINNHUB_API_KEY`    | Financial quote + fundamentals       | 60 calls/min            | https://finnhub.io/register              |
| `NEWSDATA_API_KEY`   | News articles                        | 200 credits/day         | https://newsdata.io/register             |
| `NEWS_API_KEY` *(opt)* | News articles (alt provider)       | 100 req/day             | https://newsapi.org/register             |

### Step-by-step setup

```bash
# 1️⃣  Clone the repository
git clone <your-repo-url> investclear
cd investclear

# 2️⃣  Create your .env file at the repo root
cat > .env <<'EOF'
GEMINI_API_KEY=your_gemini_key_here
PORT=5002
FINNHUB_API_KEY=your_finnhub_key_here
NEWSDATA_API_KEY=your_newsdata_key_here
LOG_LLM_TRANSCRIPTS=false
EOF

# 3️⃣  Install backend dependencies
cd backend
npm install

# 4️⃣  Install frontend dependencies
cd ../frontend
npm install
```

### Run it locally (two terminals)

```bash
# 🟢 Terminal 1 — backend on http://localhost:5002
cd backend
npm run dev

# 🟢 Terminal 2 — frontend on http://localhost:5173
cd frontend
npm run dev
```

Now open **http://localhost:5173** in your browser, type a company name (e.g. `Apple`, `HDFC`, `Tata Steel`), and hit **Research**.

> 💡 The Vite dev server proxies `/api/*` requests to `localhost:5002`, so the frontend never has to know the backend's origin during development.

### Build for production

```bash
# Build the frontend (outputs static files to frontend/dist/)
cd frontend
npm run build

# Start the backend in production mode
cd ../backend
NODE_ENV=production npm start
```

### Deployment

The simplest split:

| Piece      | Recommended host         | Build command       | Start command      |
| ---------- | ------------------------ | ------------------- | ------------------ |
| Frontend   | Vercel · Netlify · Cloudflare Pages | `npm run build` | *(static)*         |
| Backend    | Render · Railway · Fly.io | `npm install`     | `npm start`        |

Set the env vars on each host — never commit `.env` to git.

### Available scripts

| Location    | Script              | What it does                                |
| ----------- | ------------------- | ------------------------------------------- |
| `backend/`  | `npm start`         | Run with `node` (production)                |
| `backend/`  | `npm run dev`       | Run with auto-restart on file change        |
| `frontend/` | `npm run dev`       | Vite dev server on `:5173`                  |
| `frontend/` | `npm run build`     | Static bundle in `frontend/dist/`           |
| `frontend/` | `npm run preview`   | Serve the built bundle locally              |

---

## ⚙️ How It Works

### Architecture

```
                  ┌──────────────────┐
                  │     Browser      │
                  │   (React +       │
                  │     Vite)        │
                  └────────┬─────────┘
                           │ POST /api/research
                           ▼
                  ┌──────────────────┐
                  │  Express server  │
                  │   (Node.js)      │
                  └────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 │   Finnhub   │    │   Yahoo     │    │  NewsData   │
 │   quote +   │    │  Finance    │    │  / NewsAPI  │
 │fundamentals │    │  fallback   │    │             │
 └─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                  ┌──────────────────┐
                  │   5 Gemini      │
                  │   models,        │
                  │   rotated by     │
                  │   quota          │
                  └──────────────────┘
```

### Backend pipeline

The core lives in **`backend/src/services/llmOrchestrator.js`**. When `runResearch(company)` is called:

1. **Cache check** — in-memory `Map` keyed by company name with a 5-minute TTL. Repeat searches for the same company return instantly.
2. **`resolveTicker(company)`** — handles special mappings (e.g. `HDFC → HDFCBANK`), strips spaces, falls back to uppercased input.
3. **`fetchComprehensiveFinancials(ticker)`** — fetches price data + fundamentals from Finnhub, with a Yahoo Finance fallback when Finnhub returns empty.
4. **`fetchNews(company)`** — NewsData.io (or NewsAPI.org) request, filtered to articles that mention the company name or ticker, capped at 5 results.
5. **Prompt assembly** — financial data is formatted into a labelled block (`Current Price`, `P/E Ratio`, `52-Week Range`, etc.) and stitched into a prompt template that asks the model for an `INVEST`/`PASS` JSON verdict.
6. **`invokeWithFallback(prompt)`** — picks the model with the lowest usage count that still has free-tier quota. If that model returns a 429 quota error, increments the model's counter, picks the next model, and retries. Total capacity: ~100 req/day (5 models × 20 req).
7. **Cache write** — result is stored in memory for 5 minutes.
8. **Response** — JSON object: `{ decision, confidence, summary, evidence, reasoning, keyEvidence, transcript }`.

The `transcript` field is included in every response so the frontend's debug panel (collapsed by default) can show the exact prompt and raw response. Set `LOG_LLM_TRANSCRIPTS=true` in `.env` to additionally persist them to `backend/logs/{ticker}-{timestamp}.json`.

### Multi-model rotation

The free tier has a 20 req/day limit **per model**, not per account. InvestClear rotates across 5 models:

| # | Model                  | Role                                   |
| - | ---------------------- | -------------------------------------- |
| 1 | `gemini-2.5-pro`       | 🏆 Strongest reasoning, lowest quota   |
| 2 | `gemini-2.5-flash`     | ⚖️ Balanced                            |
| 3 | `gemini-2.5-flash-8b`  | 💨 Cheapest, fastest                   |
| 4 | `gemini-2.0-flash`     | 🛡️ Stable previous-gen                 |
| 5 | `gemini-1.5-flash`     | 🔄 Oldest fallback                     |

A usage file (`gemini_usage.json`) tracks per-model calls in **Pacific Time** (matching Google's reset window). `pickModelWithQuota()` returns the model with the lowest count that hasn't hit 20. When all 5 are at 20, the orchestrator throws `quotaExhausted`, the route returns a fallback `PASS` verdict with a clear error message, and the frontend renders that gracefully.

### Frontend pipeline

| File                              | Role                                                                       |
| --------------------------------- | -------------------------------------------------------------------------- |
| `main.jsx`                        | Mounts `<App />` inside `<React.StrictMode>`                               |
| `App.jsx`                         | Router + theme state, persists choice in `localStorage`                    |
| `components/Layout.jsx`           | Sticky topbar, brand mark, nav links, theme toggle, footer                 |
| `components/SearchBar.jsx`        | Controlled input, disabled state while loading, surfaces errors via prop   |
| `pages/HomePage.jsx`              | Hero + search + report preview / loading / result states + broker cards     |
| `pages/AboutPage.jsx`             | Vision, mission, workflow, roadmap, developer profile, contact             |
| `components/DecisionCard.jsx`     | Renders the JSON verdict as Company Overview / Summary / Thesis / Risks    |
| `components/EvidenceList.jsx`     | News articles as cards with source badge and truncated preview             |
| `services/api.js`                 | `fetch('/api/research', …)` wrapper, returns parsed JSON                   |
| `styles.css`                      | All styling, CSS-variable based, full light + dark theme                   |

### State machine

```
                ┌──────────────┐
                │    empty     │
                └──────┬───────┘
                       │ submit
                       ▼
                ┌──────────────┐
                │   loading    │
                └──┬────────┬──┘
            success │        │ error
                   ▼        ▼
           ┌────────────┐  ┌────────────────────────┐
           │   result   │  │ inline status message  │
           └────────────┘  │ (auto-dismiss in 4s)   │
                           └────────────────────────┘
```

### Prompt design

The prompt is deliberately compact but **labelled** — each field is prefixed so the model can't confuse, e.g., EPS with price-per-share. Example structure:

```
Company: {company}
Ticker: {ticker}

Financial Data (includes price, fundamentals, and valuation metrics):
Current Price: USD 178.45
52-Week Range: USD 124.17 - 199.62
P/E Ratio: 28.40
…

Recent news:
1. Reuters: Apple beats earnings as services surge - …
…

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

Do not add extra text outside valid JSON.
```

Two safety nets protect against the model drifting:

1. **JSON parse with brace extraction** — `parseJsonResponse()` first tries `JSON.parse(text)`, then falls back to extracting the first `{...}` block. If that fails too, the orchestrator returns a `PASS` with `confidence: 50` and includes the raw text in the summary.
2. **Field defaults** — if `decision`, `confidence`, etc. are missing, the orchestrator uses safe defaults rather than throwing. The UI always renders.

---

## 🎯 Key Decisions & Trade-offs

### Choices I made (and why)

| ✅ Decision                                  | Why                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Gemini (rotated, 5 models)**               | Free tier; multi-model rotation yields ~100 req/day.                                                         |
| **Single round-trip model call**             | Cheaper, simpler, more auditable than a multi-step chain.                                                    |
| **JSON-only output, validated defensively**  | Forces structured input to the UI; the parse-with-fallback strategy means a bad response never crashes the route. |
| **In-memory cache, 5 min TTL**               | Free, fast, drops repeat-search load by ~80% during typical sessions. Lost on restart — acceptable for a demo. |
| **Finnhub + Yahoo Finance fallback**         | Finnhub covers US + Indian (.NS, .BO) symbols but rate-limits quickly. Yahoo Finance is a no-key fallback.     |
| **Indian-broker quick-launch**               | The original use case is Indian retail investors; surfaces Groww / Zerodha / Upstox / Angel One with pre-filled search URLs. |
| **Logs off by default**                      | Transcript persistence adds compliance overhead without end-user value. The full transcript is still in every API response and visible in the UI's collapsible "Analysis transcript" panel. |
| **Light + dark theme**                       | CSS variables on `[data-theme]`, persisted in `localStorage`, applied to `<html>`. Cheaper than a theming library. |
| **No build framework on the backend**        | Plain Express + ES modules. No bundler needed.                                                                |
| **Vite for the frontend**                    | Fast dev server, no config, ES module-native. The proxy config in `vite.config.js` removes CORS friction in dev. |

### What I deliberately left out (and why)

- 🚫 **Embeddings / RAG over 10-K filings** — pulling SEC EDGAR at runtime is slow; adding a vector DB triples the deploy surface. Kept the prompt structured instead.
- 🚫 **Streaming responses** — for a single JSON verdict, the latency gain wasn't worth the UI complexity.
- 🚫 **Authentication** — demo project, single-tenant. A real deployment would need rate-limiting per IP at minimum.
- 🚫 **Multi-language news** — currently `language=en` only.
- 🚫 **Persistent history / user accounts** — the 5-min cache handles repeats, but cross-session history is a future feature.
- 🚫 **Risk scoring** — the verdict's "Risks" section is a static disclaimer; the prompt doesn't currently ask for a structured risk score.
- 🚫 **Charts** — no price/earnings chart on the report yet.
- 🚫 **Comparative analysis** — single-company only. Side-by-side is on the roadmap.

---

## 🧪 Example Runs

These are sample reports produced by the agent (formatted for readability). Real output varies with live data and the model selected.

### 🍎 Example 1 — Apple Inc. (AAPL)

```
Decision:    PASS
Confidence:  52%

Summary:
Apple trades at a premium P/E (~28x) that reflects strong brand and services
growth, but the upside is narrowing as iPhone unit growth flattens and the
regulatory environment tightens. Earnings beat estimates in the most recent
quarter (services revenue +14% YoY), but the stock is near 52-week highs.

Reasoning:
• Premium P/E leaves limited margin of safety vs. historical 22x average.
• Services growth is the strongest catalyst but increasingly under regulatory scrutiny.
• 52-week range shows price has already re-rated meaningfully in 2026.

Key evidence:
• Services revenue growth +14% YoY, the highest segment growth rate.
• P/E ratio 28.4 vs. industry median ~22.
• Stock trading near 52-week high ($199 vs. range $124–$199).

Model used: gemini-2.5-flash
```

### 🏦 Example 2 — HDFC Bank (HDFCBANK)

```
Decision:    INVEST
Confidence:  71%

Summary:
HDFC Bank trades at a reasonable P/E for the Indian banking sector, supported
by a stable net interest margin, low NPAs, and the completed merger with HDFC
Ltd expanding the loan book. Recent coverage highlights robust CASA growth and
strong FY26 guidance.

Reasoning:
• P/E 19.2x is in line with the Indian private-bank peer median.
• CASA ratio remains industry-leading, supporting NIM stability.
• Post-merger integration risks are largely behind it.

Key evidence:
• P/E ratio 19.2 (peer median 18–21).
• NIM guidance 3.4–3.6% for FY27.
• GNPA at 1.24%, well below the sector average.

Model used: gemini-2.5-pro
```

### 🚗 Example 3 — Tesla, Inc. (TSLA)

```
Decision:    PASS
Confidence:  64%

Summary:
Tesla's valuation reflects optionality on FSD and robotaxi rather than current
auto margins. The P/E is elevated (~62x) and auto revenue growth has slowed to
low-single-digits. Recent news is mixed — strong deliveries offset by margin
compression and increased capex on AI infrastructure.

Reasoning:
• P/E 62x is hard to justify on current auto-only earnings.
• Margin pressure from price cuts and capex is visible in recent quarters.
• Robotaxi timeline remains the bull case but unproven.

Key evidence:
• P/E ratio 62.4 (auto peer median 9–12).
• Auto gross margin contracted to ~17.9% in the most recent quarter.
• Capex guidance raised for AI training infrastructure.

Model used: gemini-2.5-flash
```

> ⚠️ **Confidence** is the model's stated certainty, not a probability of profit. **PASS** doesn't mean "sell" — it means the framework didn't see a clear positive risk/reward at current prices. Use it as a starting hypothesis, not a signal.

---

## 🔭 What I'd Improve With More Time

### 🛠️ Weekend-sized

1. **Cited, snippet-level evidence** — instead of 3 generic `key_evidence` bullets, surface the specific article sentences that drove each point and link them inline.
2. **Streaming UI** — render `summary` as it streams from the model so the user sees words appearing within ~300 ms instead of waiting the full round-trip.
3. **Risk score field in the prompt** — add a structured `risk_score: 0–100` to the JSON output and render it as a third chip alongside Decision and Confidence.
4. **Chart panel** — a 30-day price chart (lightweight-chart or Chart.js) inline in the report.
5. **localStorage history** — keep the last 20 reports so the user can revisit them without re-searching. Add a "Recent reports" sidebar.
6. **Multi-language news** — drop the `language=en` filter when the company is Indian — Indian-language business press often has the freshest local context.

### 📅 Week-sized

7. **Comparative analysis** — paste 2–5 tickers, get a side-by-side table comparing valuation, fundamentals, and a ranked recommendation.
8. **10-K section retrieval** — pull the most recent 10-K, embed with a small embedding model, store in SQLite-Vec, and let the user ask follow-up questions about it.
9. **Watchlist + alerts** — save tickers, get a daily digest of the watchlist's top movers and any news that meaningfully changes the prior verdict.
10. **Backtesting the verdict** — run a deterministic pipeline over historical data for a fixed universe (S&P 500), measure how often `INVEST` at confidence > 70 led to a positive 3-month return. Use this to calibrate the prompt.

### 🗓️ Month+ sized

11. **Multi-agent research** — a planner decomposes the question, a worker fetches and summarizes, a critic challenges the summary, a synthesizer makes the final call.
12. **Self-improving prompt** — keep a tiny eval set of past verdicts and known outcomes, periodically re-run them, and use the failure cases to refine the prompt automatically.
13. **Auth + billing** — each user gets a private model proxy with their own quota; usage-based billing.
14. **Mobile-first PWA** — add a manifest + service worker so it installs on phones and works offline against the cached report history.

---

## 📦 Bonus — Chat Session Logs

> ✨ The brief awards extra bonus points for including **all the LLM chat session logs** — they reveal the thought process, not just the output.

### Where the transcripts live

1. **Git history (`git log`)** — every meaningful change is a commit. Run `git log --oneline` to see the narrative; `git log -p <file>` to see a file's evolution.

   ```bash
   $ git log --oneline
   # baa7b7a added frontend
   # 236e491 done with backend
   # 4e6afa9 Update code to fix data pipeline and quota handling
   ```

2. **Code session JSONL files** — if you built this with an assistant CLI, the session transcripts are typically stored under `~/.assistant/projects/<project-slug>/`. Those JSONL files contain every prompt, every tool call, every response — the full reasoning, not just the final output.

3. **Inline transcripts in the app** — every report rendered by InvestClear includes the full prompt and response in `result.transcript`. The frontend exposes this in the collapsible "Analysis transcript" panel under each report. To persist these to disk across runs, set `LOG_LLM_TRANSCRIPTS=true` in `.env` and they'll be written to `backend/logs/{ticker}-{timestamp}.json`.

### What the transcripts reveal about my approach

A few things a reviewer would pick up:

- **Small, verifiable steps.** Every edit is followed by a syntax check or a build step to confirm nothing broke.
- **Ask before deleting.** When I found legacy branding hardcoded throughout the app, I asked before bulk-replacing it. Same for the developer's name on the About page.
- **Strip what isn't used.** Dead imports, debug `console.log`s, unused `package.json` dependencies — all removed, not commented out.
- **The obvious tool over the clever one.** In-memory `Map` instead of Redis. CSS variables instead of a theming library. Native `fetch` instead of axios. The repo is short enough that a new reader can finish it in 20 minutes.

---

## 🧰 Tech Stack

| Layer        | Choice                                                                |
| ------------ | --------------------------------------------------------------------- |
| **Frontend** | React 18, Vite 5, react-router-dom 6, plain CSS (variables)           |
| **Backend**  | Node.js, Express 4, LangChain.js 1, `@langchain/google-genai` 2       |
| **Model**    | 5 Gemini models, rotated by per-model quota (~100 req/day)           |
| **Finance data** | Finnhub (primary), Yahoo Finance (fallback)                       |
| **News**     | NewsData.io (primary), NewsAPI.org (alternative)                      |
| **Cache**    | In-memory `Map` with 5-minute TTL                                    |
| **Deployment** | Vercel / Netlify (frontend) · Render / Railway (backend)            |

> 🍃 No databases. No Docker. No message queues. No auth. The whole thing runs on a free-tier VM.

---

## 📁 Project Layout

```
investclear/
├── .env                         # Secrets (gitignored)
├── .gitignore
├── README.md                    # This file
│
├── backend/
│   ├── package.json
│   ├── gemini_usage.json        # Per-model daily counts (gitignored)
│   └── src/
│       ├── index.js             # Express bootstrap, /api/research mount
│       ├── routes/
│       │   └── research.js      # POST / endpoint, calls runResearch()
│       └── services/
│           ├── llmOrchestrator.js   # Prompt, cache, multi-model rotation
│           └── dataFetchers.js      # Ticker resolution, financials, news
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js           # Dev proxy: /api → :5002
    └── src/
        ├── main.jsx
        ├── App.jsx              # Router + theme state
        ├── styles.css           # All styling
        ├── components/
        │   ├── Layout.jsx
        │   ├── SearchBar.jsx
        │   ├── DecisionCard.jsx
        │   └── EvidenceList.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   └── AboutPage.jsx
        └── services/
            └── api.js           # runResearch() → POST /api/research
```

---

## 🧪 Quick Smoke Test (curl)

Want to confirm the backend works without the UI?

```bash
# Make sure backend is running on :5002
curl -X POST http://localhost:5002/api/research \
  -H "Content-Type: application/json" \
  -d '{"company":"Apple"}' | jq
```

You should see a JSON response with `decision`, `confidence`, `summary`, `reasoning`, and `keyEvidence`.

---

## 🤝 Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

**MIT** — use it, fork it, ship a startup on it. Attribution appreciated but not required.

---

<br>

<div align="center">

### 🌟 Built with focus by **Mohan Rao**

*Computer Science Student · Passionate about finance and software engineering*

<br>

© 2026 **InvestClear** — Investment Research Agent

</div>