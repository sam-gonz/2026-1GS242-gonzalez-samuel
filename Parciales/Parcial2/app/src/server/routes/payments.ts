import { Hono } from 'hono'
import { stripe, PACKS } from '../services/stripe'
import { ShinyPokemon } from '../models/shiny.model'
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

    const shinyPool = await ShinyPokemon.aggregate([
      { $match: { isShiny: true } },
      { $sample: { size: 5 } },
    ])
    const pokedexIds = shinyPool.map((s: any) => s.pokedexId)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.name,
              description: `${shinyPool.length} Random Shinies guaranteed!`,
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
        type: 'pack',
      },
    })

    return c.json({ sessionId: session.id, sessionUrl: session.url })
  }

  if (pokedexId) {
    const pokemon = await ShinyPokemon.findOne({ pokedexId })
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
        type: 'individual',
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

payments.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { clerkId, pokedexIds, packId, type } = session.metadata

    if (!clerkId) {
      console.error('No clerkId in webhook metadata')
      return c.json({ error: 'No clerkId' }, 400)
    }

    const user = await User.findOne({ clerkId })
    if (!user) {
      console.error('User not found for clerkId:', clerkId)
      return c.json({ error: 'User not found' }, 404)
    }

    if (type === 'pack' && packId) {
      const shinyIds = pokedexIds.split(',').map(Number).filter(Boolean)
      const newShinies = shinyIds.filter(id => !user.unlockedShinies.includes(id))
      user.unlockedShinies.push(...newShinies)
      user.purchasedPacks.push(packId)
    } else if (pokedexIds) {
      const shinyId = parseInt(pokedexIds)
      if (!user.unlockedShinies.includes(shinyId)) {
        user.unlockedShinies.push(shinyId)
      }
    }

    await user.save()
    console.log(`Delivered shinies to user ${clerkId}:`, session.metadata)
  }

  return c.json({ received: true })
})

export default payments