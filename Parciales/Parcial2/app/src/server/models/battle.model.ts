import { Schema, model } from 'mongoose'

const ActionSchema = new Schema({
  type:      { type: String, enum: ['move', 'switch'] },
  moveId:    { type: String, default: null },
  pokemonId: { type: String, default: null },
}, { _id: false })

const StatusSchema = new Schema({
  name:           { type: String },
  remainingTurns: { type: Number },
}, { _id: false })

const BattlePokemonSchema = new Schema({
  pokedexId:      { type: Number, required: true },
  name:           { type: String, required: true },
  types:          [{ type: String }],
  spriteUrl:      { type: String },
  currentHp:      { type: Number, required: true },
  maxHp:          { type: Number, required: true },
  battleStats: {
    attack:         Number,
    defense:        Number,
    specialAttack:  Number,
    specialDefense: Number,
    speed:          Number,
  },
  ivs: {
    hp:             Number,
    attack:         Number,
    defense:        Number,
    specialAttack:  Number,
    specialDefense: Number,
    speed:          Number,
  },
  statStages: {
    attack:         { type: Number, default: 0 },
    defense:        { type: Number, default: 0 },
    specialAttack:  { type: Number, default: 0 },
    specialDefense: { type: Number, default: 0 },
    speed:          { type: Number, default: 0 },
  },
  status:    { type: StatusSchema, default: null },
  moveNames: [{ type: String }], // exactamente 4
}, { _id: false })

const BattlePlayerSchema = new Schema({
  name:            { type: String, required: true },
  team:            [BattlePokemonSchema],
  activePokemonId: { type: Number, required: true }, // pokedexId del activo
  selectedAction:  { type: ActionSchema, default: null },
}, { _id: false })

const LogEntrySchema = new Schema({
  turn:    { type: Number },
  message: { type: String },
}, { _id: false })

const BattleSchema = new Schema({
  roomCode:       { type: String, required: true, unique: true },
  turn:           { type: Number, default: 1 },
  status:         { type: String, enum: ['selecting', 'active', 'ended'], default: 'selecting' },
  players:        [BattlePlayerSchema],
  battleLog:      [LogEntrySchema],
  winnerPlayerId: { type: String, default: null },
})

export const Battle = model('Battle', BattleSchema)
