import { Hono } from 'hono'
import { Pokemon } from '../models/pokemon.model'

const pokemon = new Hono()

// GET /api/pokemon?page=1&limit=20&type=fire&name=char
pokemon.get('/', async (c) => {
  try {
    const { page = '1', limit = '20', type, name } = c.req.query()
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * limitNum

    const filter: Record<string, any> = {}
    if (type) filter.types = type
    if (name) filter.name = { $regex: name, $options: 'i' }

    const [data, total] = await Promise.all([
      Pokemon.find(filter).skip(skip).limit(limitNum).lean(),
      Pokemon.countDocuments(filter),
    ])

    return c.json({
      data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (err) {
    return c.json({ error: 'Failed to fetch Pokémon' }, 500)
  }
})

// GET /api/pokemon/:id
pokemon.get('/:id', async (c) => {
  try {
    const id  = c.req.param('id')
    const doc = await Pokemon.findOne({ pokedexId: parseInt(id) }).lean()
    if (!doc) return c.json({ error: 'Pokémon not found' }, 404)
    return c.json(doc)
  } catch (err) {
    return c.json({ error: 'Failed to fetch Pokémon' }, 500)
  }
})

export default pokemon
