import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PACKS = {
  'shiny-pack-5': {
    id: 'shiny-pack-5',
    name: 'Shiny Pack (5 Pokémon)',
    description: '5 Random Shinies',
    price: 499,
  },
}

export const RARITY_PRICES: Record<string, number> = {
  common: 99,
  uncommon: 199,
  rare: 399,
  epic: 599,
  legendary: 999,
}