import React from 'react'

export default function DecisionCard({ result, query }) {
  if (!result) return null

  const {
    decision,
    confidence,
    summary,
    reasoning,
    keyEvidence,
    transcript,
  } = result

  const financials = transcript?.input?.financials || ''
  const decisionType = String(decision || '').toUpperCase() === 'INVEST' ? 'invest' : 'avoid'
  const evidenceItems = Array.isArray(keyEvidence) ? keyEvidence : []
  const reasoningItems = Array.isArray(reasoning) ? reasoning : []
  const companyLabel = query || 'Company'

  const overviewText = summary || 'No summary available.'
  const newsText = evidenceItems.length > 0 ? evidenceItems.slice(0, 3).join(' ') : 'Recent news context is being surfaced as the report is generated.'
  const thesisText = reasoningItems.length > 0 ? reasoningItems.join(' ') : 'The investment thesis will be expanded as more evidence is gathered.'
  const riskText = 'Market volatility, execution risk, and data-quality variance should be validated with additional diligence.'
  const conclusionText = `${decision || 'Review'} with ${confidence || '—'}% confidence. The report offers a structured starting point for deeper diligence.`

  return (
    <section className={`report-shell decision-card decision-card--${decisionType}`}>
      <div className="report-shell__intro">
        <div>
          <p className="section-label">Generated report</p>
          <h3>{companyLabel}</h3>
          <p>Structured analysis with key context and supporting evidence.</p>
        </div>
        <div className="report-shell__meta">
          <span className="report-chip">{decision || 'Review'}</span>
          <span className="report-chip report-chip--muted">Confidence {confidence || '—'}%</span>
        </div>
      </div>

      <div className="report-section">
        <h4>Company Overview</h4>
        <p>{overviewText}</p>
      </div>

      <div className="report-section">
        <h4>AI Summary</h4>
        <p>{overviewText}</p>
      </div>

      {financials ? (
        <div className="report-section">
          <h4>Financial Analysis</h4>
          <pre>{financials}</pre>
        </div>
      ) : null}

      <div className="report-section">
        <h4>News Analysis</h4>
        <p>{newsText}</p>
      </div>

      <div className="report-section">
        <h4>Investment Thesis</h4>
        <p>{thesisText}</p>
      </div>

      <div className="report-section">
        <h4>Risks</h4>
        <p>{riskText}</p>
      </div>

      <div className="report-section">
        <h4>Conclusion</h4>
        <p>{conclusionText}</p>
      </div>

      <div className="decision-card__footer">
        Data source: {transcript?.input?.financials?.includes('YahooFinance') ? 'Yahoo Finance + NewsData API' : 'Mixed sources'} | Model: {transcript?.providerLog?.provider || 'Unknown'}
      </div>
    </section>
  )
}