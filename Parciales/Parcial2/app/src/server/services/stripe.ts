import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PACKS = {
  'shiny-starter-pack': {
    id: 'shiny-starter-pack',
    name: 'Shiny Starter Pack',
    description: '3 Common + 2 Uncommon Shinies',
    price: 499,
    pokedexIds: [], // filled dynamically
  },
  'shiny-elite-pack': {
    id: 'shiny-elite-pack',
    name: 'Shiny Elite Pack',
    description: '2 Rare + 2 Epic + 1 Legendary Shiny',
    price: 1999,
    pokedexIds: [],
  },
}

export const RARITY_PRICES: Record<string, number> = {
  common: 99,
  uncommon: 199,
  rare: 399,
  epic: 599,
  legendary: 999,
}