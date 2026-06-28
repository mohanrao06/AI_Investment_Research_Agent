const API_URL = import.meta.env.VITE_API_URL || "";

export async function runResearch(company) {
  const res = await fetch(`${API_URL}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company }),
  })
  if (!res.ok) throw new Error('Research API error')
  return res.json()
}