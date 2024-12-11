import { scrapeCards } from '@/app/actions/scrapCards'

// Remove the 'use server' directive from scrapeCards.ts first!

async function main() {
  console.log('Starting scrape...')
  const result = await scrapeCards(1)
  console.log('Result:', result)
  process.exit(0)
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
}) 