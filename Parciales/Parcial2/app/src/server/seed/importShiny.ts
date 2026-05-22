import { connectDB } from '../db'
import { ShinyPokemon } from '../models/shiny.model'

const POKEAPI = 'https://pokeapi.co/api/v2'
const TOTAL = 150

const RARITY_CONFIG = [
  { rarity: 'legendary', weight: 3,  price: 999 },
  { rarity: 'epic',      weight: 7,  price: 599 },
  { rarity: 'rare',      weight: 20, price: 399 },
  { rarity: 'uncommon',  weight: 30, price: 199 },
  { rarity: 'common',    weight: 40, price: 99  },
]

function pickRarity(): { rarity: string, price: number } {
  const totalWeight = RARITY_CONFIG.reduce((sum, r) => sum + r.weight, 0)
  let rand = Math.random() * totalWeight
  for (const r of RARITY_CONFIG) {
    rand -= r.weight
    if (rand <= 0) return { rarity: r.rarity, price: r.price }
  }
  return { rarity: 'common', price: 99 }
}

async function fetchJSON(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`)
  return res.json()
}

async function main() {
  await connectDB()

  console.log(`\n🔄 Importing ${TOTAL} Shiny Pokémon from PokéAPI...`)

  const { results } = await fetchJSON(`${POKEAPI}/pokemon?limit=${TOTAL}&offset=0`)
  const allMoveUrls: string[] = []

  for (const { url } of results) {
    try {
      const data = await fetchJSON(url)

      const shinySprite =
        data.sprites?.front_shiny ??
        data.sprites?.other?.['official-artwork']?.front_shiny ??
        data.sprites?.front_default ??
        ''

      const validMoves = data.moves
        .map((m: any) => ({ name: m.move.name, url: m.move.url }))
        .filter((_: any, i: number) => i < 30)

      const moveNames = validMoves.slice(0, 20).map((m: any) => m.name)
      validMoves.forEach((m: any) => allMoveUrls.push(m.url))

      const { rarity, price } = pickRarity()

      const boostedStats = {
        hp:             Math.floor((data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat ?? 0) * 1.15),
        attack:         Math.floor((data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat ?? 0) * 1.15),
        defense:        Math.floor((data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat ?? 0) * 1.15),
        specialAttack:  Math.floor((data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat ?? 0) * 1.15),
        specialDefense: Math.floor((data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat ?? 0) * 1.15),
        speed:          Math.floor((data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat ?? 0) * 1.15),
      }

      await ShinyPokemon.findOneAndUpdate(
        { pokedexId: data.id },
        {
          pokedexId: data.id,
          name:      data.name,
          types:     data.types.map((t: any) => t.type.name),
          baseStats: boostedStats,
          spriteUrl: shinySprite,
          rarity,
          price,
          moveIds:   moveNames,
          isShiny:   true,
        },
        { upsert: true }
      )
      process.stdout.write('.')
    } catch (err) {
      console.error(`\nError importing shiny: ${url}`, err)
    }
  }

  console.log(`\n✅ ${TOTAL} Shiny Pokémon imported!`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})