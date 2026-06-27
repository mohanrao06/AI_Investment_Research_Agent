import React from 'react'

export default function DecisionCard({ result }) {
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

  const decisionColor = decision === 'INVEST' ? '#27ae60' : '#e74c3c'
  const decisionBgColor = decision === 'INVEST' ? '#d5f4e6' : '#fadbd8'

  return (
    <div style={{
      border: `2px solid ${decisionColor}`,
      borderRadius: 8,
      padding: 20,
      marginTop: 20,
      backgroundColor: '#f9f9f9',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `2px solid ${decisionColor}`,
        paddingBottom: 15,
        marginBottom: 15,
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          color: decisionColor,
        }}>
          {decision || '—'}
        </h1>
        <div style={{
          backgroundColor: decisionBgColor,
          padding: '8px 16px',
          borderRadius: 20,
          fontWeight: 'bold',
          color: decisionColor,
          fontSize: 16,
        }}>
          Confidence: {confidence}%
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: 10 }}>Summary</h3>
        <p style={{
          backgroundColor: '#ecf0f1',
          padding: 12,
          borderRadius: 4,
          lineHeight: 1.6,
          color: '#2c3e50',
          margin: 0,
        }}>
          {summary || 'No summary available'}
        </p>
      </div>

      {/* Financial Data */}
      {financials && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: 10 }}>Financial Data</h3>
          <pre style={{
            backgroundColor: '#ecf0f1',
            padding: 12,
            borderRadius: 4,
            fontSize: 12,
            maxHeight: 200,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            margin: 0,
            color: '#2c3e50',
          }}>
            {financials}
          </pre>
        </div>
      )}

      {/* Key Evidence */}
      {keyEvidence && keyEvidence.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: 10 }}>Key Evidence</h3>
          <ul style={{
            margin: 0,
            paddingLeft: 20,
          }}>
            {keyEvidence.map((evidence, idx) => (
              <li key={idx} style={{
                marginBottom: 8,
                color: '#2c3e50',
                lineHeight: 1.5,
              }}>
                {evidence}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && reasoning.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: 10 }}>Analysis & Reasoning</h3>
          <ol style={{
            margin: 0,
            paddingLeft: 20,
          }}>
            {reasoning.map((reason, idx) => (
              <li key={idx} style={{
                marginBottom: 8,
                color: '#2c3e50',
                lineHeight: 1.5,
              }}>
                {reason}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Data Source */}
      <div style={{
        borderTop: '1px solid #bdc3c7',
        paddingTop: 12,
        marginTop: 12,
        fontSize: 12,
        color: '#7f8c8d',
      }}>
        Data Source: {transcript?.input?.financials?.includes('YahooFinance') ? 'Yahoo Finance + NewsData API' : 'Mixed Sources'} | Model: {transcript?.providerLog?.provider}
      </div>
    </div>
  )
}