# AI Investment Research Agent — Implementation Plan (React + Node/Express)

This README is a step-by-step, actionable plan to implement the AI Investment Research Agent using React (Vite) for the frontend and Node.js + Express for the backend. It covers setup, development steps, prompts, examples, testing, and packaging for submission.

---

**Quick summary**: build a React UI that accepts a company name, send requests to a Node/Express backend which orchestrates research using LangChain.js and an LLM provider, then return an `Invest`/`Pass` decision with reasoning, evidence and LLM transcripts.

## Tech stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- AI orchestration: LangChain.js (or LangGraph.js)
- LLM provider: OpenAI / Anthropic / other (configurable via env)
- Optional: Vector DB (Pinecone/Weaviate/local) for retrieval

## Repository layout (recommended)

- frontend/  — React app (Vite)
  - src/
  - public/
  - package.json
- backend/ — Node + Express API
  - src/
    - index.js
    - routes/research.js
    - services/
      - dataFetchers.js
      - llmOrchestrator.js
  - package.json
- .env.example
- README.md (this file)

## Environment variables (.env.example)

OPENAI_API_KEY=
PORT=3000
DATA_API_KEY=      # Optional: for news / finance APIs
VECTOR_DB_URL=     # Optional
LOG_LLM_TRANSCRIPTS=true

---

## Step-by-step implementation plan (executable steps)

The plan below breaks the work into granular steps with commands and file targets so you can follow exactly what to do and when.

Day 0 — Setup repository and basic README (1–2 hours)

1. Create project folders and initialize git (if not already):

```bash
mkdir ai-investment-agent && cd ai-investment-agent
git init
mkdir frontend backend
```

2. Create `.env.example` at repo root with fields from this README.

3. Commit initial structure:

```bash
git add .
git commit -m "chore: repo skeleton and README"
```

Day 1 — Frontend scaffold (React + Vite) (2–4 hours)

1. Scaffold the frontend using Vite:

```bash
cd frontend
npx create-vite@latest . -- --template react
npm install
```

2. Update `package.json` scripts (should already include `dev`, `build`, `preview`).

3. Implement UI components (create these files):

- `src/App.jsx` — main layout and search form
- `src/components/SearchBar.jsx` — input for company name
- `src/components/DecisionCard.jsx` — displays Invest/Pass, confidence
- `src/components/EvidenceList.jsx` — lists evidence & sources
- `src/services/api.js` — wrapper to call backend endpoints

4. Start dev server for frontend:

```bash
cd frontend
npm run dev
```

Day 2 — Backend scaffold (Express) and core API (3–5 hours)

1. Initialize backend:

```bash
cd ../backend
npm init -y
npm install express cors dotenv
npm install -D nodemon
```

2. Add scripts to `backend/package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon --watch src --exec node src/index.js"
}
```

3. Create `src/index.js` (basic Express server):

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const research = require('./routes/research');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/research', research);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
```

4. Create `src/routes/research.js` (sketch):

```js
const express = require('express');
const router = express.Router();
const { runResearch } = require('../services/llmOrchestrator');

router.post('/', async (req, res) => {
  const { company } = req.body;
  if (!company) return res.status(400).json({ error: 'company required' });
  try {
    const result = await runResearch(company);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
```

Day 3 — Data fetchers and LLM orchestration (4–6 hours)

1. Create `backend/src/services/dataFetchers.js` with functions:
  - `resolveTicker(companyName)` — normalize to ticker using a free API
  - `fetchFinancials(ticker)` — financial metrics
  - `fetchNews(company)` — recent news articles
  - `fetchSocialSentiment(company)` — optional Twitter/Reddit sentiment

2. Create `backend/src/services/llmOrchestrator.js` which:
  - Imports LangChain.js and chosen LLM client
  - Builds prompt templates and chains for summarization, evidence extraction, and final decision
  - Records LLM prompts + responses to a transcript/log if `LOG_LLM_TRANSCRIPTS=true`

Example `runResearch(company)` workflow:

- Normalize company name → ticker
- Collect structured data (financials)
- Collect unstructured data (news, transcripts)
- (Optional) create embeddings for retrieval
- Summarize each data source (short summaries)
- Compose a reasoning prompt with summaries and ask LLM for thesis + decision
- Return structured JSON: `{ decision, confidence, summary, evidence: [...], transcript }`

3. Test `runResearch()` with a mocked LLM or a small prompt to ensure the flow works.

Day 4 — Connect frontend + backend; UI polish (3–5 hours)

1. Implement `src/services/api.js` in the frontend calling `/api/research` with POST and company name.

2. Wire `SearchBar` to call the API and show a loading state, then render `DecisionCard` and `EvidenceList`.

3. Add error handling and a simple UX for rate limiting / LLM errors.

Day 5 — Logging, transcripts, and example runs (3–4 hours)

1. Ensure LLM calls log full transcripts to disk or to a `logs/` folder (obfuscate API keys).

2. Run 3–5 example companies and save outputs into `examples/` for the README.

3. Add a UI button to download the decision as a JSON / PDF for submission.

Day 6 — Optional vector store & retrieval improvements (4–6 hours)

1. Add embeddings: when summarizing large text sets, create embeddings and use a vector DB for retrieval.

2. Integrate Pinecone or local FAISS alternative. Add connectors in `services/` and retrieval step in `llmOrchestrator`.

Day 7 — Tests, packaging and zip for submission (2–4 hours)

1. Add simple unit tests for data fetchers (jest) and integraton test for `/api/research` with mocked LLM.

2. Create `examples/` include 3 sample runs and transcripts.

3. Prepare zip: include `frontend/`, `backend/`, `README.md`, `.env.example`, `examples/`:

```bash
zip -r submission.zip frontend backend README.md .env.example examples
```

4. Final commit and tag:

```bash
git add .
git commit -m "feat: complete assignment ready for packaging"
git tag v1.0-submission
```

---

## Example minimal code snippets (copy into files)

backend/src/index.js

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const research = require('./routes/research');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/research', research);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
```

backend/src/services/llmOrchestrator.js (sketch)

```js
// Pseudocode sketch — implement with LangChain.js and provider SDK
async function runResearch(company) {
  // 1. resolveTicker
  // 2. fetch data
  // 3. summarize each data source with LLM
  // 4. final reasoning prompt to LLM
  // 5. return structured result and transcript
}

module.exports = { runResearch };
```

frontend/src/services/api.js

```js
export async function runResearch(company) {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company }),
  });
  return res.json();
}
```

---

## Prompting & LLM guidance (examples)

Main decision prompt (condensed):

"You are an investment research assistant. Given the following summarized evidence (financial metrics, latest news headlines with dates and sources, sentiment scores), prepare: (1) a short 3–4 sentence investment thesis, (2) three supporting reasons, (3) three risks, (4) a final recommendation: INVEST or PASS, with a numeric confidence 0-100 and a short explanation of the confidence. Use source citations where possible and keep answers concise." 

Chain strategy:
- Use a cheap model for per-source summaries.
- Use a stronger model for combining summaries and final decision.

Safety: always request the model to mark statements that are speculative.

LLM transcript logging: store input prompt and model response together with timestamp and source context. If `LOG_LLM_TRANSCRIPTS=true` write to `logs/{company}-{timestamp}.json`.

---

## Testing checklist
- Manual: search 3 companies and verify responses.
- Unit: test data fetchers handle missing data gracefully.
- Integration: mock LLM responses to validate the backend API format.

## Submission checklist (final)
- Confirm README includes required assignment sections (Overview, How to run, How it works, Decisions & trade-offs, Example runs, What to improve).
- Include `examples/` with transcripts.
- Zip repository and check `submission.zip` contains everything.

---

If you want, I can now scaffold the actual files (frontend + backend starter code) in this workspace following the plan above. Reply with `scaffold now` to proceed, or `only README` if this is enough.
