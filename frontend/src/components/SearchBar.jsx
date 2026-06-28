import React, { useState } from 'react'
import { runResearch } from '../services/api'

export default function SearchBar({ onResult, onQueryChange, onLoadingChange }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const query = q.trim()
    if (!query) return

    setLoading(true)
    onLoadingChange?.(true)
    onResult?.(null)
    onQueryChange?.(query)

    try {
      const res = await runResearch(query)
      onResult?.(res)
    } catch (err) {
      console.error(err)
      alert('Error running research: ' + err.message)
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  function handleChange(event) {
    setQ(event.target.value)
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="company-search">
        Company search
      </label>
      <div className="search-input-group">
        <span className="search-input-group__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          id="company-search"
          value={q}
          onChange={handleChange}
          placeholder="Enter company name or ticker (e.g., HDFC, TCS, SBI)"
          autoComplete="off"
        />
      </div>
      <button type="submit" disabled={loading || !q.trim()}>
        {loading ? 'Researching…' : 'Research'}
      </button>
    </form>
  )
}