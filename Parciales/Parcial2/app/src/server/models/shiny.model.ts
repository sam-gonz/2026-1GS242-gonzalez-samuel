import { Schema, model } from 'mongoose'

const ShinyPokemonSchema = new Schema({
  pokedexId: { type: Number, required: true, unique: true },
  name:      { type: String, required: true },
  types:     [{ type: String }],
  baseStats: {
    hp:             { type: Number, required: true },
    attack:         { type: Number, required: true },
    defense:        { type: Number, required: true },
    specialAttack:  { type: Number, required: true },
    specialDefense: { type: Number, required: true },
    speed:          { type: Number, required: true },
  },
  spriteUrl:   { type: String, required: true },
  rarity:      { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], required: true },
  price:       { type: Number, required: true },
  moveIds:     [{ type: String }],
  isShiny:     { type: Boolean, default: true },
})

export const ShinyPokemon = model('ShinyPokemon', ShinyPokemonSchema)