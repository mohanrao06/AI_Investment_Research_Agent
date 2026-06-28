import express from 'express'
import { runResearch } from '../services/llmOrchestrator.js'

const router = express.Router()

router.post('/', async (req, res) => {
  const { company } = req.body
  if (!company) return res.status(400).json({ error: 'company required' })
  try {
    const result = await runResearch(company)
    res.json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal' })
  }
})

export default router