import React from 'react'

export default function DecisionCard({ decision, confidence, summary }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
      <h2>{decision || '—'}</h2>
      <div><strong>Confidence:</strong> {confidence ?? '—'}</div>
      <p style={{ marginTop: 8 }}>{summary}</p>
    </div>
  )
}