import { Hono } from 'hono'
import { stripe, PACKS } from '../services/stripe'
import { Pokemon } from '../models/pokemon.model'
import { User } from '../models/user.model'

const payments = new Hono()

payments.post('/create-checkout', async (c) => {
  const body = await c.req.json()
  const { clerkId, pokedexId, packId } = body

  if (!clerkId) {
    return c.json({ error: 'clerkId is required' }, 400)
  }

  const origin = c.req.header('origin') || 'http://localhost:5173'

  if (packId && PACKS[packId]) {
    const pack = PACKS[packId]
    let pokedexIds: number[] = []

    if (packId === 'shiny-starter-pack') {
      const common = await Pokemon.find({ isShiny: true, rarity: 'common' }).limit(3).select('pokedexId')
      const uncommon = await Pokemon.find({ isShiny: true, rarity: 'uncommon' }).limit(2).select('pokedexId')
      pokedexIds = [...common.map(p => p.pokedexId), ...uncommon.map(p => p.pokedexId)]
    } else if (packId === 'shiny-elite-pack') {
      const rare = await Pokemon.find({ isShiny: true, rarity: 'rare' }).limit(2).select('pokedexId')
      const epic = await Pokemon.find({ isShiny: true, rarity: 'epic' }).limit(2).select('pokedexId')
      const legendary = await Pokemon.find({ isShiny: true, rarity: 'legendary' }).limit(1).select('pokedexId')
      pokedexIds = [
        ...rare.map(p => p.pokedexId),
        ...epic.map(p => p.pokedexId),
        ...legendary.map(p => p.pokedexId),
      ]
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.name,
              description: pack.description,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/shop?success=true&packId=${packId}`,
      cancel_url: `${origin}/shop?canceled=true`,
      metadata: {
        clerkId,
        packId,
        pokedexIds: pokedexIds.join(','),
      },
    })

    return c.json({ sessionId: session.id, sessionUrl: session.url })
  }

  if (pokedexId) {
    const pokemon = await Pokemon.findOne({ pokedexId, isShiny: true })
    if (!pokemon) {
      return c.json({ error: 'Shiny Pokemon not found' }, 404)
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shiny ${pokemon.name}`,
              description: `Rarity: ${pokemon.rarity}`,
            },
            unit_amount: pokemon.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/shop?success=true&pokedexId=${pokedexId}`,
      cancel_url: `${origin}/shop?canceled=true`,
      metadata: {
        clerkId,
        pokedexIds: String(pokedexId),
      },
    })

    return c.json({ sessionId: session.id, sessionUrl: session.url })
  }

  return c.json({ error: 'pokedexId or packId is required' }, 400)
})

payments.get('/user-shinies/:clerkId', async (c) => {
  const { clerkId } = c.req.param()
  const user = await User.findOne({ clerkId })
  if (!user) {
    return c.json({ unlockedShinies: [], purchasedPacks: [] })
  }
  return c.json({
    unlockedShinies: user.unlockedShinies,
    purchasedPacks: user.purchasedPacks,
  })
})

export default payments