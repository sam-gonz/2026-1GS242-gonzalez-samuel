import { z } from 'zod';

export const gameEnum = z.enum(['pokemon', 'yugioh', 'onepiece', 'dragonball', 'magic', 'other']);
export const conditionEnum = z.enum(['mint', 'near-mint', 'excellent', 'good', 'played', 'poor']);
export const cardStatusEnum = z.enum(['available', 'sold', 'reserved', 'deleted']);

export const cardCreateSchema = z.object({
  title: z.string().min(1).max(200),
  game: gameEnum,
  set: z.string().min(1).max(200),
  cardNumber: z.string().max(50).optional(),
  condition: conditionEnum,
  price: z.number().positive(),
  currency: z.string().default('USD'),
  images: z.array(z.string().url()).min(1).max(10),
  description: z.string().max(2000).optional(),
});

export const cardUpdateSchema = cardCreateSchema.partial();

export const cardFilterSchema = z.object({
  game: gameEnum.optional(),
  condition: conditionEnum.optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const userSchema = z.object({
  clerkId: z.string(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const userUpdateSchema = userSchema.omit({ clerkId: true, email: true }).partial();

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const tradeCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  haves: z.array(z.object({
    cardName: z.string().min(1),
    game: gameEnum,
    condition: conditionEnum,
    images: z.array(z.string().url()).optional(),
    quantity: z.number().int().positive().default(1),
  })).min(1),
  wants: z.array(z.object({
    cardName: z.string().min(1),
    game: gameEnum,
    condition: conditionEnum.optional(),
    notes: z.string().max(500).optional(),
  })).min(1),
});

export const tradeOfferSchema = z.object({
  offeringCards: z.array(z.object({
    cardName: z.string().min(1),
    game: gameEnum,
    condition: conditionEnum,
    images: z.array(z.string().url()).optional(),
  })).min(1),
  message: z.string().max(1000).optional(),
});

export const orderCreateSchema = z.object({
  cardId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid card ID' }),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    zip: z.string().min(1),
  }),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  game: gameEnum,
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export type Game = z.infer<typeof gameEnum>;
export type CardCondition = z.infer<typeof conditionEnum>;
export type CardStatus = z.infer<typeof cardStatusEnum>;