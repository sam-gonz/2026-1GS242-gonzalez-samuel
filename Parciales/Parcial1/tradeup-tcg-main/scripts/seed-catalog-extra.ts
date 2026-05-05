#!/usr/bin/env bun
/**
 * seed-catalog-extra.ts
 * Pobla la coleccion CatalogCard con cartas adicionales.
 *
 * Fuentes:
 *   - MTG:        https://api.scryfall.com       (gratis, sin key)
 *   - Yu-Gi-Oh!:  https://db.ygoprodeck.com/api/v7 (gratis, sin key)
 *   - Dragon Ball: cartas de muestra hardcodeadas (no existe API publica)
 *
 * Uso:
 *   cd tradeup-tcg-main
 *   bun scripts/seed-catalog-extra.ts
 *
 * Variables de entorno necesarias:
 *   MONGODB_URI
 */

import mongoose from 'mongoose'
import { CatalogCard } from '../packages/db/src/index.js'

// ─── Config ────────────────────────────────────────────────────────────────────
const MONGODB_URI =
  process.env['MONGODB_URI'] ??
  (() => { throw new Error('MONGODB_URI not set. Copia apps/api/.env o exporta la variable.') })()

// ─── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function mtgRarity(raw: string | undefined): string {
  if (!raw) return 'other'
  const r = raw.toLowerCase()
  if (r === 'mythic')  return 'secret_rare'
  if (r === 'rare')    return 'rare'
  if (r === 'uncommon') return 'uncommon'
  if (r === 'common')  return 'common'
  return 'other'
}

function yugiohRarity(raw: string | undefined): string {
  if (!raw) return 'other'
  const r = raw.toLowerCase()
  if (r.includes('secret')) return 'secret_rare'
  if (r.includes('ultra'))  return 'ultra_rare'
  if (r.includes('super'))  return 'super_rare'
  if (r.includes('rare'))   return 'rare'
  if (r.includes('common')) return 'common'
  return 'other'
}

// ─── MTG via Scryfall ──────────────────────────────────────────────────────────
// Sets icónicos de Magic: The Gathering
const MTG_SETS = [
  { code: 'lea',  name: 'Alpha' },
  { code: 'arn',  name: 'Arabian Nights' },
  { code: 'mir',  name: 'Mirage' },
  { code: 'inv',  name: 'Invasion' },
  { code: 'rav',  name: 'Ravnica: City of Guilds' },
  { code: 'zen',  name: 'Zendikar' },
  { code: 'isd',  name: 'Innistrad' },
  { code: 'ktk',  name: 'Khans of Tarkir' },
  { code: 'bfz',  name: 'Battle for Zendikar' },
  { code: 'war',  name: 'War of the Spark' },
  { code: 'mid',  name: 'Midnight Hunt' },
  { code: 'dmu',  name: 'Dominaria United' },
]

async function fetchMTGSet(setCode: string, setName: string): Promise<any[]> {
  // Scryfall pagina con has_more + next_page
  let url: string | null =
    `https://api.scryfall.com/cards/search?q=set:${setCode}&order=set&unique=prints`
  const all: any[] = []

  while (url) {
    console.log(`    GET ${url}`)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TradeUpTCG-Seed/1.0' },
    })

    if (res.status === 404) {
      console.warn(`    ⚠️  Set ${setCode} no encontrado en Scryfall`)
      break
    }
    if (!res.ok) {
      console.warn(`    ⚠️  Scryfall error ${res.status} para set ${setCode}`)
      break
    }

    const json = await res.json() as { data: any[]; has_more: boolean; next_page?: string }
    all.push(...(json.data ?? []))

    url = json.has_more && json.next_page ? json.next_page : null
    if (url) await sleep(100) // Scryfall pide >= 50-100ms entre requests
  }

  return all
}

async function seedMTG() {
  let total = 0

  for (const { code, name } of MTG_SETS) {
    console.log(`  📦 MTG set: ${name} (${code})`)
    const cards = await fetchMTGSet(code, name)

    const docs = cards
      .filter((c: any) => c.name && c.collector_number)
      .map((c: any) => ({
        game: 'mtg',
        name: c.name,
        set: c.set_name ?? name,
        setCode: (c.set ?? code).toUpperCase(),
        cardNumber: c.collector_number ?? '0',
        rarity: mtgRarity(c.rarity),
        imageUrl:
          c.image_uris?.small ??
          c.image_uris?.normal ??
          c.card_faces?.[0]?.image_uris?.small,
        language: c.lang ?? 'en',
      }))

    if (docs.length > 0) {
      await CatalogCard.insertMany(docs, { ordered: false }).catch((e) => {
        if (e.code !== 11000) console.warn('  Insert warn:', e.message)
      })
      total += docs.length
      console.log(`    ✅ ${name}: ${docs.length} cartas insertadas`)
    }

    await sleep(200)
  }

  return total
}

// ─── Yu-Gi-Oh! extra arquetipos ────────────────────────────────────────────────
// Arquetipos distintos a los del seed-catalog.ts original
const YGO_EXTRA_ARCHETYPES = [
  'Exodia',
  'Cyber Dragon',
  'Six Samurai',
  'Gladiator Beast',
  'Infernity',
  'Gravekeepers',
  'Ghostrick',
  'Mermail',
  'Burning Abyss',
  'Shaddoll',
  'Frightfur',
  'Magician',
  'Crusadia',
  'Nibiru',
  'Adamancipator',
]

async function seedYugiohExtra() {
  let total = 0

  for (const archetype of YGO_EXTRA_ARCHETYPES) {
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${encodeURIComponent(archetype)}&num=100&offset=0`
    console.log(`  📦 YGO archetype: ${archetype}`)
    const res = await fetch(url)

    if (!res.ok) {
      console.warn(`    ⚠️  YGO error ${res.status} para "${archetype}"`)
      await sleep(300)
      continue
    }

    const json = await res.json() as { data: any[] }
    const cards = json.data ?? []

    const docs = cards.flatMap((c: any) => {
      const sets: any[] = c.card_sets ?? []
      if (sets.length === 0) {
        return [{
          game: 'yugioh',
          name: c.name,
          set: 'Unknown Set',
          setCode: 'YGO',
          cardNumber: String(c.id),
          rarity: 'other',
          imageUrl:
            c.card_images?.[0]?.image_url_small ??
            c.card_images?.[0]?.image_url,
          language: 'en',
        }]
      }
      return sets.slice(0, 3).map((s: any) => ({
        game: 'yugioh',
        name: c.name,
        set: s.set_name ?? 'Unknown',
        setCode: s.set_code ?? 'YGO',
        cardNumber: s.set_code ?? String(c.id),
        rarity: yugiohRarity(s.set_rarity),
        imageUrl:
          c.card_images?.[0]?.image_url_small ??
          c.card_images?.[0]?.image_url,
        language: 'en',
      }))
    })

    if (docs.length > 0) {
      await CatalogCard.insertMany(docs, { ordered: false }).catch((e) => {
        if (e.code !== 11000) console.warn('  Insert warn:', e.message)
      })
      total += docs.length
      console.log(`    ✅ ${archetype}: ${docs.length} entradas insertadas`)
    }

    await sleep(500)
  }

  return total
}

// ─── Dragon Ball Super Card Game — muestra hardcodeada ────────────────────────
// No existe API publica oficial para DBS TCG.
async function seedDragonBall() {
  const sample = [
    // Serie 1 — Galactic Battle
    { name: 'Son Goku, the Awakened Power',         set: 'Galactic Battle',       cardNumber: 'BT1-031',  rarity: 'secret_rare' },
    { name: 'Vegeta, Prince of Destruction',         set: 'Galactic Battle',       cardNumber: 'BT1-077',  rarity: 'ultra_rare'  },
    { name: 'Frieza, Emperor of the Universe',       set: 'Galactic Battle',       cardNumber: 'BT1-109',  rarity: 'ultra_rare'  },
    { name: 'Piccolo, Proud Namekian',               set: 'Galactic Battle',       cardNumber: 'BT1-047',  rarity: 'rare'        },
    { name: 'Krillin, Earthling Warrior',            set: 'Galactic Battle',       cardNumber: 'BT1-042',  rarity: 'uncommon'    },
    // Serie 2 — Union Force
    { name: 'SS Son Goku, the Awakened Power',       set: 'Union Force',           cardNumber: 'BT2-022',  rarity: 'secret_rare' },
    { name: 'Android 18, Universe 7\'s Last Hope',   set: 'Union Force',           cardNumber: 'BT2-071',  rarity: 'ultra_rare'  },
    { name: 'Trunks, Defender of the Future',        set: 'Union Force',           cardNumber: 'BT2-042',  rarity: 'super_rare'  },
    { name: 'Gohan, the Gifted',                     set: 'Union Force',           cardNumber: 'BT2-040',  rarity: 'rare'        },
    { name: 'Cell, Perfect Form',                    set: 'Union Force',           cardNumber: 'BT2-097',  rarity: 'ultra_rare'  },
    // Serie 3 — Cross Worlds
    { name: 'SS3 Son Goku',                          set: 'Cross Worlds',          cardNumber: 'BT3-031',  rarity: 'secret_rare' },
    { name: 'Beerus, God of Destruction',            set: 'Cross Worlds',          cardNumber: 'BT3-103',  rarity: 'ultra_rare'  },
    { name: 'Whis, Heavenly Guide',                  set: 'Cross Worlds',          cardNumber: 'BT3-107',  rarity: 'super_rare'  },
    { name: 'Broly, Legendary Super Saiyan',         set: 'Cross Worlds',          cardNumber: 'BT3-133',  rarity: 'secret_rare' },
    // Serie 4 — Colossal Warfare
    { name: 'Vegito, Potara Fusion',                 set: 'Colossal Warfare',      cardNumber: 'BT4-001',  rarity: 'secret_rare' },
    { name: 'Gogeta, Metamoran Fusion',              set: 'Colossal Warfare',      cardNumber: 'BT4-040',  rarity: 'secret_rare' },
    { name: 'SSB Son Goku',                          set: 'Colossal Warfare',      cardNumber: 'BT4-023',  rarity: 'ultra_rare'  },
    { name: 'SSB Vegeta',                            set: 'Colossal Warfare',      cardNumber: 'BT4-076',  rarity: 'ultra_rare'  },
    { name: 'Hit, Universe 6\'s Assassin',           set: 'Colossal Warfare',      cardNumber: 'BT4-060',  rarity: 'super_rare'  },
    // Serie 5 — Miraculous Revival
    { name: 'Ultra Instinct Son Goku',               set: 'Miraculous Revival',    cardNumber: 'BT5-108',  rarity: 'secret_rare' },
    { name: 'Jiren, the Unbeatable',                 set: 'Miraculous Revival',    cardNumber: 'BT5-155',  rarity: 'ultra_rare'  },
    { name: 'Android 17, Protector of Nature',       set: 'Miraculous Revival',    cardNumber: 'BT5-038',  rarity: 'super_rare'  },
    { name: 'Toppo, Righteous Aid',                  set: 'Miraculous Revival',    cardNumber: 'BT5-150',  rarity: 'rare'        },
    // Serie 6 — Destroyer Kings
    { name: 'Janemba, Menace of the Underworld',     set: 'Destroyer Kings',       cardNumber: 'BT6-110',  rarity: 'secret_rare' },
    { name: 'Golden Frieza, Resurrected Emperor',    set: 'Destroyer Kings',       cardNumber: 'BT6-106',  rarity: 'ultra_rare'  },
    { name: 'SS Son Gohan, the Gifted Warrior',      set: 'Destroyer Kings',       cardNumber: 'BT6-026',  rarity: 'super_rare'  },
    // Serie 7 — Assault of the Saiyans
    { name: 'SS2 Son Goku, Furious Awakening',       set: 'Assault of the Saiyans', cardNumber: 'BT7-031', rarity: 'secret_rare' },
    { name: 'SS2 Vegeta, Electrifying Powerhouse',   set: 'Assault of the Saiyans', cardNumber: 'BT7-077', rarity: 'ultra_rare'  },
    { name: 'Bardock, Father of Goku',               set: 'Assault of the Saiyans', cardNumber: 'BT7-012', rarity: 'super_rare'  },
    { name: 'Raditz, Saiyan Invader',                set: 'Assault of the Saiyans', cardNumber: 'BT7-008', rarity: 'uncommon'    },
    // Serie 8 — Malicious Machinations
    { name: 'Android 21, Brilliant Scientist',       set: 'Malicious Machinations', cardNumber: 'BT8-120', rarity: 'secret_rare' },
    { name: 'Dr. Gero, Mastermind Creator',          set: 'Malicious Machinations', cardNumber: 'BT8-115', rarity: 'ultra_rare'  },
    { name: 'Android 16, Protector of Peace',        set: 'Malicious Machinations', cardNumber: 'BT8-074', rarity: 'rare'        },
  ]

  const docs = sample.map((c) => ({
    game: 'dragonball',
    name: c.name,
    set: c.set,
    setCode: c.cardNumber.split('-')[0] ?? 'BT1',
    cardNumber: c.cardNumber,
    rarity: c.rarity,
    imageUrl: undefined,
    language: 'en',
  }))

  await CatalogCard.insertMany(docs, { ordered: false }).catch((e) => {
    if (e.code !== 11000) console.warn('  Insert warn:', e.message)
  })
  console.log(`    ✅ Dragon Ball: ${docs.length} cartas de muestra insertadas`)
  return docs.length
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Conectando a MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Conectado\n')

  const existing = await CatalogCard.countDocuments()
  console.log(`ℹ️  Cartas existentes en catalogo: ${existing}\n`)
  console.log('   Agregando sin borrar (se saltaran duplicados)...\n')

  console.log('━━━ Magic: The Gathering (Scryfall) ━━━')
  const mtgCount = await seedMTG()

  console.log('\n━━━ Yu-Gi-Oh! extra arquetipos ━━━')
  const ygoCount = await seedYugiohExtra()

  console.log('\n━━━ Dragon Ball Super Card Game ━━━')
  const dbCount = await seedDragonBall()

  const total = mtgCount + ygoCount + dbCount
  console.log(`\n🎉 Seed extra completo: ${total} cartas insertadas`)
  console.log(`   MTG:          ${mtgCount}`)
  console.log(`   Yu-Gi-Oh!:    ${ygoCount}`)
  console.log(`   Dragon Ball:  ${dbCount}`)

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
