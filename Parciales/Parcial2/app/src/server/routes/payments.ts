import { Hono } from 'hono'
import { stripe, PACKS } from '../services/stripe'
import { ShinyPokemon } from '../models/shiny.model'
import { User } from '../models/user.model'

const payments = new Hono()

// ─── Crear sesión de Stripe ────────────────────────────────────────────────────
payments.post('/create-checkout', async (c) => {
  const body = await c.req.json()
  const { clerkId, pokedexId, packId } = body

  console.log('[payments] create-checkout body:', body)

  if (!clerkId) return c.json({ error: 'clerkId is required' }, 400)

  const origin = c.req.header('origin') || 'http://localhost:5173'

  // ─── PACK ─────────────────────────────────────────────────────────────────
  if (packId && PACKS[packId]) {
    const pack = PACKS[packId]
    const shinyPool = await ShinyPokemon.aggregate([
      { $match: { isShiny: true } },
      { $sample: { size: 5 } },
    ])
    const pokedexIds = shinyPool.map((s: any) => s.pokedexId)
    const idsParam = pokedexIds.join(',')
    console.log('[payments] pack shinies seleccionados:', idsParam)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: pack.name, description: `${shinyPool.length} Random Shinies!` },
          unit_amount: pack.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/shop?success=true&packId=${packId}&ids=${idsParam}&ck=${clerkId}`,
      cancel_url:  `${origin}/shop?canceled=true`,
      metadata: { clerkId, packId, pokedexIds: idsParam, type: 'pack' },
    })
    console.log('[payments] session creada (pack):', session.id)
    return c.json({ sessionId: session.id, sessionUrl: session.url })
  }

  // ─── INDIVIDUAL ───────────────────────────────────────────────────────────
  if (pokedexId) {
    const pokemon = await ShinyPokemon.findOne({ pokedexId })
    if (!pokemon) {
      console.error('[payments] Shiny no encontrado para pokedexId:', pokedexId)
      return c.json({ error: 'Shiny Pokemon not found' }, 404)
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Shiny ${pokemon.name}`, description: `Rarity: ${pokemon.rarity}` },
          unit_amount: pokemon.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      // FIX: ids= incluido para que confirm-purchase se ejecute al regresar
      success_url: `${origin}/shop?success=true&ids=${pokedexId}&ck=${clerkId}`,
      cancel_url:  `${origin}/shop?canceled=true`,
      metadata: { clerkId, pokedexIds: String(pokedexId), type: 'individual' },
    })
    console.log('[payments] session creada (individual):', session.id, 'pokemon:', pokemon.name)
    return c.json({ sessionId: session.id, sessionUrl: session.url })
  }

  return c.json({ error: 'pokedexId or packId is required' }, 400)
})

// ─── Confirmar compra (fallback al webhook) ────────────────────────────────────
payments.post('/confirm-purchase', async (c) => {
  const body = await c.req.json()
  console.log('[payments] confirm-purchase body recibido:', body)

  const { clerkId, pokedexIds, packId } = body

  if (!clerkId || !pokedexIds) {
    console.error('[payments] confirm-purchase: faltan campos', { clerkId, pokedexIds })
    return c.json({ error: 'clerkId y pokedexIds requeridos' }, 400)
  }

  const user = await User.findOne({ clerkId })
  if (!user) {
    console.error('[payments] confirm-purchase: usuario no encontrado para clerkId:', clerkId)
    // Intentar buscar por id alternativo por si el formato difiere
    const allUsers = await User.find({}).limit(5).select('clerkId')
    console.error('[payments] Muestra de clerkIds en BD:', allUsers.map((u: any) => u.clerkId))
    return c.json({ error: 'Usuario no encontrado' }, 404)
  }

  const ids: number[] = String(pokedexIds).split(',').map(Number).filter(Boolean)
  console.log('[payments] IDs a entregar:', ids)

  const newShinies = ids.filter((id) => !user.unlockedShinies.includes(id))
  user.unlockedShinies.push(...newShinies)

  if (packId && !user.purchasedPacks.includes(packId)) {
    user.purchasedPacks.push(packId)
  }

  await user.save()
  console.log(`[payments] ✅ Entregados ${newShinies.length} shinies a ${clerkId}. Total ahora: ${user.unlockedShinies.length}`)
  return c.json({ ok: true, added: newShinies.length, total: user.unlockedShinies.length })
})

// ─── Obtener shinies del usuario ──────────────────────────────────────────────
payments.get('/user-shinies/:clerkId', async (c) => {
  const { clerkId } = c.req.param()
  const user = await User.findOne({ clerkId })
  if (!user) {
    console.warn('[payments] user-shinies: usuario no encontrado:', clerkId)
    return c.json({ unlockedShinies: [], purchasedPacks: [] })
  }
  return c.json({ unlockedShinies: user.unlockedShinies, purchasedPacks: user.purchasedPacks })
})

// ─── Webhook de Stripe ────────────────────────────────────────────────────────
payments.post('/webhook', async (c) => {
  const sig  = c.req.header('stripe-signature')
  const body = await c.req.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[payments] Webhook signature verification failed:', err.message)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { clerkId, pokedexIds, packId, type } = session.metadata
    console.log('[payments] webhook checkout.session.completed:', { clerkId, pokedexIds, packId, type })

    if (!clerkId) return c.json({ error: 'No clerkId' }, 400)

    const user = await User.findOne({ clerkId })
    if (!user) {
      console.error('[payments] webhook: usuario no encontrado:', clerkId)
      return c.json({ error: 'User not found' }, 404)
    }

    if (type === 'pack' && packId) {
      const ids = pokedexIds.split(',').map(Number).filter(Boolean)
      const newShinies = ids.filter((id: number) => !user.unlockedShinies.includes(id))
      user.unlockedShinies.push(...newShinies)
      if (!user.purchasedPacks.includes(packId)) user.purchasedPacks.push(packId)
    } else if (pokedexIds) {
      const id = parseInt(pokedexIds)
      if (!user.unlockedShinies.includes(id)) user.unlockedShinies.push(id)
    }

    await user.save()
    console.log(`[payments] webhook ✅ Shinies entregados a ${clerkId}`)
  }

  return c.json({ received: true })
})

export default payments
