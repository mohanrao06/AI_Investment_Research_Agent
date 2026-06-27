export async function runResearch(company) {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company }),
  })
  if (!res.ok) throw new Error('Research API error')
  return res.json()
}