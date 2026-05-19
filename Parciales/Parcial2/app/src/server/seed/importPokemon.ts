import { connectDB } from '../db'
import { Pokemon } from '../models/pokemon.model'
import { Move } from '../models/move.model'
import { TypeChart } from '../models/typechart.model'

const POKEAPI = 'https://pokeapi.co/api/v2'
const TOTAL = 300

async function fetchJSON(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`)
  return res.json()
}

async function importTypes() {
  console.log('\n🔄 Importing type chart...')
  const { results } = await fetchJSON(`${POKEAPI}/type?limit=50`)

  for (const { url } of results) {
    const data = await fetchJSON(url)
    const attackingType: string = data.name

    // Ignorar tipos internos sin relaciones de daño
    if (!data.damage_relations) continue

    const doubleDamageTo  = data.damage_relations.double_damage_to.map((t: any) => t.name)
    const halfDamageTo    = data.damage_relations.half_damage_to.map((t: any) => t.name)
    const noDamageTo      = data.damage_relations.no_damage_to.map((t: any) => t.name)

    await TypeChart.findOneAndUpdate(
      { attackingType },
      { attackingType, doubleDamageTo, halfDamageTo, noDamageTo },
      { upsert: true }
    )
    process.stdout.write('.')
  }
  console.log('\n✅ Type chart imported')
}

async function importMoves(moveUrls: string[]) {
  const uniqueUrls = [...new Set(moveUrls)]
  for (const url of uniqueUrls) {
    try {
      const data = await fetchJSON(url)
      if (!data.power && data.damage_class?.name === 'status') continue // solo guardar moves útiles

      await Move.findOneAndUpdate(
        { name: data.name },
        {
          name:        data.name,
          type:        data.type.name,
          power:       data.power ?? null,
          accuracy:    data.accuracy ?? null,
          priority:    data.priority ?? 0,
          damageClass: data.damage_class?.name ?? 'status',
          effect:      data.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect ?? null,
        },
        { upsert: true }
      )
    } catch (_) {
      // ignorar movimientos que fallen
    }
  }
}

async function importPokemon() {
  console.log(`\n🔄 Importing ${TOTAL} Pokémon...`)
  const { results } = await fetchJSON(`${POKEAPI}/pokemon?limit=${TOTAL}&offset=0`)
  const allMoveUrls: string[] = []

  for (const { url } of results) {
    try {
      const data = await fetchJSON(url)

      const sprite =
        data.sprites?.front_default ??
        data.sprites?.other?.['official-artwork']?.front_default ??
        ''

      // Filtrar movimientos que tengan power (excluyendo status puro sin power)
      const validMoves = data.moves
        .map((m: any) => ({
          name: m.move.name,
          url:  m.move.url,
        }))
        .filter((_: any, i: number) => i < 30) // limitar para no sobrecargar el seed

      const moveNames = validMoves.slice(0, 20).map((m: any) => m.name)
      validMoves.forEach((m: any) => allMoveUrls.push(m.url))

      await Pokemon.findOneAndUpdate(
        { pokedexId: data.id },
        {
          pokedexId: data.id,
          name:      data.name,
          types:     data.types.map((t: any) => t.type.name),
          baseStats: {
            hp:             data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat ?? 0,
            attack:         data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat ?? 0,
            defense:        data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat ?? 0,
            specialAttack:  data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat ?? 0,
            specialDefense: data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat ?? 0,
            speed:          data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat ?? 0,
          },
          spriteUrl: sprite,
          moveIds:   moveNames,
        },
        { upsert: true }
      )
      process.stdout.write('.')
    } catch (err) {
      console.error(`\nError importing pokemon: ${url}`, err)
    }
  }

  console.log(`\n✅ ${TOTAL} Pokémon imported`)
  return allMoveUrls
}

async function main() {
  await connectDB()
  await importTypes()
  const moveUrls = await importPokemon()
  console.log('\n🔄 Importing moves (this may take a while)...')
  await importMoves(moveUrls)
  console.log('\n✅ All data imported successfully!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
