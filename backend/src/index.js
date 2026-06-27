import dotenv from 'dotenv'
const result = dotenv.config({ path: '../.env' })
console.log('Dotenv result:', result)
console.log('PORT:', process.env.PORT)
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET')

import express from 'express'
import cors from 'cors'
import research from './routes/research.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/research', research)

const requestedPort = Number(process.env.PORT || 5002)

function startServer(portToUse) {
  const server = app.listen(portToUse, () => console.log(`Server running on ${portToUse}`))
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = portToUse + 1
      console.warn(`Port ${portToUse} is busy. Trying ${nextPort}...`)
      server.close(() => startServer(nextPort))
    } else {
      console.error('Failed to start server:', error)
      process.exit(1)
    }
  })
}

startServer(requestedPort)
