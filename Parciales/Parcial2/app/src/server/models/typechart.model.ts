import { Schema, model } from 'mongoose'

// Guarda las relaciones de daño de UN tipo atacante contra todos los tipos defensores
const TypeChartSchema = new Schema({
  attackingType: { type: String, required: true, unique: true },
  doubleDamageTo:  [{ type: String }], // x2
  halfDamageTo:    [{ type: String }], // x0.5
  noDamageTo:      [{ type: String }], // x0
})

export const TypeChart = model('TypeChart', TypeChartSchema)
