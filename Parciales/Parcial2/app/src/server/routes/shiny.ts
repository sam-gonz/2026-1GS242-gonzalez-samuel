import { Hono } from 'hono'
import { ShinyPokemon } from '../models/shiny.model'

const shiny = new Hono()

shiny.get('/', async (c) => {
  try {
    const { page = '1', limit = '20', type, name, rarity } = c.req.query()
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * limitNum

    const filter: Record<string, any> = { isShiny: true }
    if (type)   filter.types  = type
    if (name)   filter.name   = { $regex: name, $options: 'i' }
    if (rarity) filter.rarity = rarity

    const [data, total] = await Promise.all([
      ShinyPokemon.find(filter).skip(skip).limit(limitNum).lean(),
      ShinyPokemon.countDocuments(filter),
    ])

    return c.json({
      data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (err) {
    return c.json({ error: 'Failed to fetch Shiny Pokémon' }, 500)
  }
})

shiny.get('/:id', async (c) => {
  try {
    const id  = c.req.param('id')
    const doc = await ShinyPokemon.findOne({ pokedexId: parseInt(id) }).lean()
    if (!doc) return c.json({ error: 'Shiny Pokémon not found' }, 404)
    return c.json(doc)
  } catch (err) {
    return c.json({ error: 'Failed to fetch Shiny Pokémon' }, 500)
  }
})

shiny.post('/random-pack', async (c) => {
  try {
    const body = await c.req.json()
    const { count = 5, rarity } = body

    const filter: Record<string, any> = { isShiny: true }
    if (rarity) filter.rarity = rarity

    const pool = await ShinyPokemon.aggregate([
      { $match: filter },
      { $sample: { size: Math.min(count, 20) } },
    ])

    return c.json({ data: pool })
  } catch (err) {
    return c.json({ error: 'Failed to generate pack' }, 500)
  }
})

export default shiny