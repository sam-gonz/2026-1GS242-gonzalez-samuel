import { Schema, model } from 'mongoose'

const PokemonSchema = new Schema({
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
  spriteUrl: { type: String, required: true },
  moveIds:   [{ type: String }],
})

export const Pokemon = model('Pokemon', PokemonSchema)
