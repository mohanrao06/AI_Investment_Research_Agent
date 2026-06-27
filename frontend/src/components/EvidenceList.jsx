import React from 'react'

export default function EvidenceList({ evidence }) {
  if (!evidence || evidence.length === 0) return null

  return (
    <div style={{
      marginTop: 20,
      padding: 20,
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      border: '1px solid #e0e0e0',
    }}>
      <h2 style={{ color: '#2c3e50', marginTop: 0, marginBottom: 15 }}>
        📰 Recent News & Evidence
      </h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {evidence.map((e, i) => (
          <div key={i} style={{
            padding: 15,
            backgroundColor: '#fff',
            borderRadius: 6,
            border: '1px solid #ecf0f1',
            borderLeft: '4px solid #3498db',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: 8,
            }}>
              <strong style={{ color: '#2c3e50', fontSize: 14 }}>
                {e.source}
              </strong>
              {e.url && (
                <a href={e.url} target="_blank" rel="noreferrer" style={{
                  color: '#3498db',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}>
                  READ
                </a>
              )}
            </div>
            <div style={{
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: 8,
              lineHeight: 1.4,
              fontSize: 14,
            }}>
              {e.title}
            </div>
            <div style={{
              color: '#555',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {e.snippet}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}