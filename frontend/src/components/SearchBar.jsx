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
      alert('Error running research')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company name or ticker" style={{ flex: 1, padding: 8 }} />
      <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Researching...' : 'Research'}</button>
    </form>
  )
}