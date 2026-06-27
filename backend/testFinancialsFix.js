import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')
console.log('Loading .env from:', envPath)
const result = dotenv.config({ path: envPath })
console.log('Dotenv result:', result.error ? result.error.message : 'Loaded successfully')
console.log('FINNHUB_API_KEY:', process.env.FINNHUB_API_KEY ? 'SET' : 'NOT SET')
console.log('DATA_API_KEY:', process.env.DATA_API_KEY ? 'SET' : 'NOT SET')

import { fetchFinancials, resolveTicker } from './src/services/dataFetchers.js'

async function testFinancials() {
  const companies = ['HDFC', 'TCS', 'RELIANCE', 'INFY']
  
  console.log('\n\nTesting financial data fetching...\n')
  
  for (const company of companies) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Testing: ${company}`)
    console.log('='.repeat(60))
    
    const ticker = await resolveTicker(company)
    console.log(`Resolved ticker: ${ticker}`)
    
    const financials = await fetchFinancials(ticker)
    console.log(`Result:`, JSON.stringify(financials, null, 2))
  }
}

testFinancials().catch(console.error)
