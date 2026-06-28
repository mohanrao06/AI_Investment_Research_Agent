import React, { useEffect, useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar'
import DecisionCard from '../components/DecisionCard'
import EvidenceList from '../components/EvidenceList'

const loadingSteps = [
  'Finding company',
  'Collecting financial statements',
  'Reading recent news',
  'Analyzing earnings',
  'Building investment report',
]

const brokerProfiles = [
  {
    name: 'Groww',
    icon: 'G',
    color: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    buildUrl: (company) => `https://groww.in/search?q=${encodeURIComponent(company)}`,
  },
  {
    name: 'Zerodha',
    icon: 'Z',
    color: 'linear-gradient(135deg, #111827, #374151)',
    buildUrl: (company) => `https://kite.zerodha.com/?q=${encodeURIComponent(company)}`,
  },
  {
    name: 'Upstox',
    icon: 'U',
    color: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    buildUrl: (company) => `https://upstox.com/search?query=${encodeURIComponent(company)}`,
  },
  {
    name: 'Angel One',
    icon: 'A',
    color: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    buildUrl: (company) => `https://trade.angelone.in/?symbol=${encodeURIComponent(company)}`,
  },
]

export default function HomePage() {
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const [shareState, setShareState] = useState('')

  const brokerLinks = useMemo(() => {
    if (!query.trim()) return []
    return brokerProfiles.map((broker) => ({
      ...broker,
      url: broker.buildUrl(query.trim()),
    }))
  }, [query])

  useEffect(() => {
    if (!loading) return undefined

    setLoadingStepIndex(0)
    const timer = window.setInterval(() => {
      setLoadingStepIndex((current) => (current + 1) % loadingSteps.length)
    }, 1200)

    return () => window.clearInterval(timer)
  }, [loading])

  function handleDownloadPdf() {
    const reportText = [
      'Northstar Research Report',
      `Company: ${query || 'Unknown'}`,
      `Decision: ${result?.decision || '—'}`,
      `Confidence: ${result?.confidence || '—'}%`,
      `Summary: ${result?.summary || ''}`,
      `Reasoning: ${Array.isArray(result?.reasoning) ? result.reasoning.join(' | ') : ''}`,
      `Evidence: ${Array.isArray(result?.keyEvidence) ? result.keyEvidence.join(' | ') : ''}`,
    ].join('\n')

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Northstar Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin-bottom: 8px; }
            .meta { color: #4b5563; margin-bottom: 16px; }
            pre { white-space: pre-wrap; word-break: break-word; }
          </style>
        </head>
        <body>
          <h1>Northstar Research Report</h1>
          <div class="meta">Company: ${query || 'Unknown'}</div>
          <pre>${reportText}</pre>
        </body>
      </html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    setShareState('PDF preview opened. Use your browser to save as PDF.')
  }

  async function handleShareReport() {
    const reportText = [
      `Northstar Research Report for ${query || 'Unknown'}`,
      result?.summary || '',
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Northstar Research Report', text: reportText })
        setShareState('Report shared successfully.')
        return
      } catch {
        setShareState('Sharing cancelled.')
        return
      }
    }

    try {
      await navigator.clipboard.writeText(reportText)
      setShareState('Report copied to clipboard.')
    } catch {
      setShareState('Sharing is unavailable in this browser.')
    }
  }

  return (
    <main className="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="section-label">Research workspace</p>
          <h1 id="hero-title">AI Investment Research Made Simple</h1>
          <p className="hero__copy">
            Research any publicly traded company using AI. Generate structured investment reports using
            financial statements, market data, earnings reports, and recent news.
          </p>
        </div>

        <div className="search-shell">
          <SearchBar
            onResult={setResult}
            onQueryChange={setQuery}
            onLoadingChange={setLoading}
          />
        </div>
      </section>

      <section className="workspace-card" aria-labelledby="research-panel-title">
        <div className="workspace-card__header">
          <div>
            <p className="section-label">Research</p>
            <h2 id="research-panel-title">Investment report</h2>
          </div>
          <div className="workspace-card__meta">Fast • Structured • Auditable</div>
        </div>

        {loading ? (
          <div className="loading-card" aria-live="polite">
            <div className="loading-card__spinner" aria-hidden="true" />
            <div>
              <h3>Preparing your report</h3>
              <p>Our analysis is being assembled in real time.</p>
              <div className="loading-steps">
                {loadingSteps.map((step, index) => {
                  const state = index < loadingStepIndex ? 'is-complete' : index === loadingStepIndex ? 'is-active' : ''
                  return (
                    <div key={step} className={`loading-step ${state}`}>
                      <span className="loading-step__dot" />
                      <span>{step}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : !result ? (
          <div className="report-preview" aria-label="Report preview">
            <div className="report-preview__header">
              <p className="section-label">Preview</p>
              <h3>Research report preview</h3>
            </div>
            <div className="report-preview__body">
              <div className="report-preview__card">
                <div className="report-preview__title">Company Overview</div>
                <div className="report-preview__line report-preview__line--wide" />
                <div className="report-preview__line" />
                <div className="report-preview__line" />
              </div>
              <div className="report-preview__card">
                <div className="report-preview__title">Signal Snapshot</div>
                <div className="report-preview__line report-preview__line--wide" />
                <div className="report-preview__line" />
              </div>
            </div>
            <p className="empty-state__hint">Enter a company name or ticker to generate a structured report.</p>
          </div>
        ) : (
          <div className="result-stack">
            <DecisionCard result={result} query={query} />
            <EvidenceList evidence={result.evidence || []} />

            <div className="report-actions">
              <button type="button" className="primary-button" onClick={handleDownloadPdf}>
                Download Report (PDF)
              </button>
              <button type="button" className="secondary-button" onClick={handleShareReport}>
                Share Report
              </button>
            </div>
            {shareState ? <p className="share-status">{shareState}</p> : null}

            {brokerLinks.length > 0 ? (
              <section className="investing-strip" aria-labelledby="broker-title">
                <div className="workspace-card__header">
                  <div>
                    <p className="section-label">Continue investing</p>
                    <h2 id="broker-title">View {query} on leading brokers</h2>
                  </div>
                </div>
                <div className="broker-grid">
                  {brokerLinks.map((broker) => (
                    <a key={broker.name} className="broker-card" href={broker.url} target="_blank" rel="noreferrer">
                      <span className="broker-card__icon" style={{ background: broker.color }}>
                        {broker.icon}
                      </span>
                      <span>{broker.name}</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <details className="debug-panel">
              <summary>LLM transcript</summary>
              <pre>{JSON.stringify(result.transcript, null, 2)}</pre>
            </details>
          </div>
        )}
      </section>
    </main>
  )
}
