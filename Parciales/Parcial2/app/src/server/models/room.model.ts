import { Schema, model } from 'mongoose'

const PlayerSchema = new Schema({
  name:  { type: String, required: true },
  ready: { type: Boolean, default: false },
}, { _id: false })

const RoomSchema = new Schema({
  code:      { type: String, required: true, unique: true },
  status:    { type: String, enum: ['waiting', 'selecting', 'battle', 'ended'], default: 'waiting' },
  players:   [PlayerSchema],
  createdAt: { type: Date, default: Date.now },
})

export const Room = model('Room', RoomSchema)
