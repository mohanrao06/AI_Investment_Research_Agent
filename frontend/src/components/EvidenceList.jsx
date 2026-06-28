import React from 'react'

function cleanText(value) {
  if (typeof value !== 'string') return ''

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(value, maxLength) {
  const text = cleanText(value)
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export default function EvidenceList({ evidence }) {
  if (!evidence || evidence.length === 0) return null

  return (
    <section className="evidence-panel" aria-label="Recent evidence">
      <div className="evidence-panel__header">
        <div>
          <p className="section-label">News</p>
          <h3>Latest market updates</h3>
        </div>
      </div>
      <div className="evidence-list">
      {evidence.map((e, i) => {
        const title = truncateText(e.title, 80)
        const snippet = truncateText(e.snippet, 120)
        const source = cleanText(e.source) || 'Source'
        const initials = source
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0] || '')
          .join('')
          .toUpperCase()

        return (
          <article key={i} className="evidence-item">
            <div className="evidence-item__visual" aria-hidden="true">
              <span>{initials || 'N'}</span>
            </div>
            <div className="evidence-item__body">
              <div className="evidence-item__header">
                <span className="evidence-item__source">{source}</span>
                {e.url && (
                  <a className="evidence-item__link" href={e.url} target="_blank" rel="noreferrer">
                    Read
                  </a>
                )}
              </div>
              {title ? <h4 className="evidence-item__title">{title}</h4> : null}
              {snippet ? <p className="evidence-item__copy">{snippet}</p> : null}
            </div>
          </article>
        )
      })}
      </div>
    </section>
  )
}