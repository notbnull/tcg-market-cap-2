// app/actions/scrapeCards.tsß
import { PokemonCardModel } from '../mongodb/models/PokemonCard'
import mongoose from "mongoose"

export async function scrapeCards(page: number) {
  try {
    // Connect to MongoDB (using your existing env variables)
    await mongoose.connect(process.env.MONGODB_URI!)
    
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?page=${page}`)
    const { data } = await response.json()
    
    await PokemonCardModel.insertMany(data)
    
    await mongoose.disconnect()
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error }
  }
}