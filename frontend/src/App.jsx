import React, { useState } from 'react'
import SearchBar from './components/SearchBar'
import DecisionCard from './components/DecisionCard'
import EvidenceList from './components/EvidenceList'

export default function App() {
  const [result, setResult] = useState(null)

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI Investment Research Agent</h1>
      <SearchBar onResult={setResult} />
      {result && (
        <div>
          <DecisionCard decision={result.decision} confidence={result.confidence} summary={result.summary} />
          <EvidenceList evidence={result.evidence || []} />
          <details style={{ marginTop: 12 }}>
            <summary>LLM Transcript</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.transcript, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}