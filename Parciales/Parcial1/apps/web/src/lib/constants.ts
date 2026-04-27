export const GAME_COLORS: Record<string, string> = {
  pokemon: '#FFD700',
  yugioh: '#8B5CF6',
  onepiece: '#EF4444',
  dragonball: '#F97316',
  magic: '#166534',
  other: '#6B7280',
};

export const CONDITION_LABELS: Record<string, string> = {
  mint: 'Mint',
  'near-mint': 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  played: 'Played',
  poor: 'Poor',
};

export const GAME_LABELS: Record<string, string> = {
  pokemon: 'Pokémon',
  yugioh: 'Yu-Gi-Oh!',
  onepiece: 'One Piece',
  dragonball: 'Dragon Ball',
  magic: 'Magic: The Gathering',
  other: 'Other',
};

export const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  sold: 'Sold',
  reserved: 'Reserved',
  deleted: 'Deleted',
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
  open: 'Open',
  closed: 'Closed',
  completed: 'Completed',
};

export type Game = keyof typeof GAME_COLORS;
export type Condition = keyof typeof CONDITION_LABELS;