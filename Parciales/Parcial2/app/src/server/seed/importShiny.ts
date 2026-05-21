import { connectDB } from '../db'
import { Pokemon } from '../models/pokemon.model'

const RARITY_THRESHOLDS: [string, number][] = [
  ['legendary', 5],
  ['epic', 15],
  ['rare', 35],
  ['uncommon', 70],
  ['common', 100],
]

function assignRarity(): { rarity: string; price: number } {
  const roll = Math.random() * 100
  for (const [rarity, threshold] of RARITY_THRESHOLDS) {
    if (roll < threshold) {
      const prices: Record<string, number> = {
        common: 99,
        uncommon: 199,
        rare: 399,
        epic: 599,
        legendary: 999,
      }
      return { rarity, price: prices[rarity] }
    }
  }
  return { rarity: 'common', price: 99 }
}

async function seedShinies() {
  await connectDB()
  console.log('Seeding shiny Pokémon...')

  const existingShinies = await Pokemon.countDocuments({ isShiny: true })
  console.log(`Already have ${existingShinies} shinies`)

  const regularPokemon = await Pokemon.find({ isShiny: false }).lean()
  console.log(`Found ${regularPokemon.length} regular Pokémon`)

  let created = 0

  for (const p of regularPokemon) {
    const { rarity, price } = assignRarity()
    const shinySpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.pokedexId}.png`

    await Pokemon.create({
      pokedexId: p.pokedexId + 10000,
      name: `${p.name} Shiny`,
      types: p.types,
      baseStats: p.baseStats,
      spriteUrl: p.spriteUrl,
      moveIds: p.moveIds,
      isShiny: true,
      shinySpriteUrl,
      rarity,
      price,
    })
    created++
  }

  console.log(`Created ${created} shiny Pokémon`)
  const total = await Pokemon.countDocuments({ isShiny: true })
  console.log(`Total shinies in DB: ${total}`)
  process.exit(0)
}

seedShinies().catch((err) => {
  console.error(err)
  process.exit(1)
})