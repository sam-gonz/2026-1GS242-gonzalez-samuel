import mongoose from "mongoose";
import Skin from "../models/skin.model";

const SKINS = [
  // Fichas medievales
  { id: "knight-pieces", name: "Fichas Caballero", type: "pieces", price: 3.99, colors: { primary: "#8b7355", secondary: "#5c4033", accent: "#d4af37" } },
  { id: "royal-pieces", name: "Fichas Reales", type: "pieces", price: 4.99, colors: { primary: "#daa520", secondary: "#b8860b", accent: "#ffd700" } },
  { id: "crusader-pieces", name: "Fichas Cruzado", type: "pieces", price: 4.49, colors: { primary: "#f5f5dc", secondary: "#8b0000", accent: "#ffffff" } },
  { id: "dark-knight-pieces", name: "Fichas Caballero Oscuro", type: "pieces", price: 4.99, colors: { primary: "#2d2418", secondary: "#1a1410", accent: "#8b0000" } },
  { id: "viking-pieces", name: "Fichas Vikingo", type: "pieces", price: 4.49, colors: { primary: "#4682b4", secondary: "#2c5f7c", accent: "#c0c0c0" } },
  { id: "dragon-pieces", name: "Fichas Dragon", type: "pieces", price: 5.99, colors: { primary: "#8b0000", secondary: "#4a0000", accent: "#ff4500" } },
  { id: "gold-pieces", name: "Fichas Doradas", type: "pieces", price: 2.99, colors: { primary: "#ffd700", secondary: "#b8860b", accent: "#fff8dc" } },
  { id: "crystal-pieces", name: "Fichas de Cristal", type: "pieces", price: 3.99, colors: { primary: "#87ceeb", secondary: "#4682b4", accent: "#e0f7fa" } },
  { id: "ruby-pieces", name: "Fichas de Rubi", type: "pieces", price: 3.99, colors: { primary: "#e0115f", secondary: "#9b111e", accent: "#ffb6c1" } },
  { id: "emerald-pieces", name: "Fichas Esmeralda", type: "pieces", price: 3.99, colors: { primary: "#50c878", secondary: "#228b22", accent: "#98fb98" } },
  { id: "obsidian-pieces", name: "Fichas Obsidiana", type: "pieces", price: 4.49, colors: { primary: "#3d3d3d", secondary: "#1a1a1a", accent: "#666666" } },
  { id: "neon-pieces", name: "Fichas Neon", type: "pieces", price: 4.99, colors: { primary: "#ff00ff", secondary: "#00ffff", accent: "#ffff00" } },
  { id: "fire-pieces", name: "Fichas de Fuego", type: "pieces", price: 4.99, colors: { primary: "#ff4500", secondary: "#8b0000", accent: "#ffa500" } },
  { id: "ice-pieces", name: "Fichas de Hielo", type: "pieces", price: 4.99, colors: { primary: "#b0e0e6", secondary: "#4682b4", accent: "#ffffff" } },
  
  // Tableros medievales
  { id: "castle-board", name: "Tablero Castillo", type: "board", price: 3.99, colors: { primary: "#8b7355", secondary: "#5c4033" } },
  { id: "dungeon-board", name: "Tablero Mazmorra", type: "board", price: 4.49, colors: { primary: "#2d2418", secondary: "#1a1410" } },
  { id: "throne-board", name: "Tablero Trono", type: "board", price: 5.99, colors: { primary: "#daa520", secondary: "#8b6914" } },
  { id: "battlefield-board", name: "Tablero Campo de Batalla", type: "board", price: 3.49, colors: { primary: "#6b8e23", secondary: "#556b2f" } },
  { id: "tavern-board", name: "Tablero Taberna", type: "board", price: 2.99, colors: { primary: "#8b4513", secondary: "#5c2e0e" } },
  { id: "marble-board", name: "Tablero Marmol", type: "board", price: 2.99, colors: { primary: "#f5f5f0", secondary: "#d4cfc4" } },
  { id: "dark-wood", name: "Tablero Roble Oscuro", type: "board", price: 1.99, colors: { primary: "#4a3728", secondary: "#2c1810" } },
  { id: "cherry-wood", name: "Tablero Cerezo", type: "board", price: 2.49, colors: { primary: "#8b4513", secondary: "#5c2e0e" } },
  { id: "ocean-board", name: "Tablero Oceano", type: "board", price: 3.49, colors: { primary: "#006994", secondary: "#003366" } },
  { id: "forest-board", name: "Tablero Bosque", type: "board", price: 3.49, colors: { primary: "#228b22", secondary: "#006400" } },
  { id: "sunset-board", name: "Tablero Atardecer", type: "board", price: 3.99, colors: { primary: "#ff6b35", secondary: "#8b0000" } },
  { id: "galaxy-board", name: "Tablero Galaxia", type: "board", price: 4.99, colors: { primary: "#1a0033", secondary: "#000000" } },
  { id: "gold-board", name: "Tablero Dorado", type: "board", price: 5.99, colors: { primary: "#ffd700", secondary: "#b8860b" } },
];

async function seed() {
  const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/checkers";
  await mongoose.connect(MONGO_URL);
  for (const skin of SKINS) {
    await Skin.findOneAndUpdate({ id: skin.id }, skin, { upsert: true });
  }
  console.log(`Seeded ${SKINS.length} skins`);
  await mongoose.disconnect();
}

seed().catch(console.error);
