import { Schema, model } from 'mongoose'

const MoveSchema = new Schema({
  name:        { type: String, required: true, unique: true },
  type:        { type: String, required: true },
  power:       { type: Number, default: null },
  accuracy:    { type: Number, default: null },
  priority:    { type: Number, default: 0 },
  damageClass: { type: String, enum: ['physical', 'special', 'status'], required: true },
  effect:      { type: String, default: null },
})

export const Move = model('Move', MoveSchema)
