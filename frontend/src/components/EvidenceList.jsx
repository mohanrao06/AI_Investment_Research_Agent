import React from 'react'

export default function EvidenceList({ evidence }) {
  if (!evidence || evidence.length === 0) return null
  return (
    <div style={{ marginTop: 12 }}>
      <h3>Evidence</h3>
      <ul>
        {evidence.map((e, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <div><strong>{e.source}</strong> — {e.title}</div>
            <div style={{ fontSize: 13 }}>{e.snippet}</div>
            {e.url && <div><a href={e.url} target="_blank" rel="noreferrer">source</a></div>}
          </li>
        ))}
      </ul>
    </div>
  )
}