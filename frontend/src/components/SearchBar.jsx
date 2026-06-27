import React, { useState } from 'react'
import { runResearch } from '../services/api'

export default function SearchBar({ onResult }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!q) return
    setLoading(true)
    try {
      const res = await runResearch(q)
      onResult(res)
    } catch (err) {
      console.error(err)
      alert('Error running research: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{
      display: 'flex',
      gap: 12,
      marginTop: 20,
      marginBottom: 20,
    }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Enter company name or ticker (e.g., HDFC, TCS, SBI)"
        style={{
          flex: 1,
          padding: '12px 16px',
          borderRadius: 6,
          border: '2px solid #e0e0e0',
          fontSize: 14,
          fontFamily: 'inherit',
          transition: 'border-color 0.3s',
          outline: 'none',
        }}
        onFocus={(e) => e.target.style.borderColor = '#3498db'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      />
      <button
        type="submit"
        disabled={loading || !q}
        style={{
          padding: '12px 24px',
          borderRadius: 6,
          border: 'none',
          backgroundColor: loading ? '#95a5a6' : '#3498db',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 14,
          cursor: loading || !q ? 'not-allowed' : 'pointer',
          opacity: loading || !q ? 0.7 : 1,
          transition: 'all 0.3s',
        }}
      >
        {loading ? '⏳ Researching...' : '🔍 Research'}
      </button>
    </form>
  )
}