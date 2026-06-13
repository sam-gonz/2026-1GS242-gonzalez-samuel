import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { connectDB } from "./db";
import authRouter from "./routes/auth";
import roomsRouter from "./routes/rooms";
import gameRouter from "./routes/game";
import rankingRouter from "./routes/ranking";
import paymentsRouter from "./routes/payments";
import Skin from "./models/skin.model";

const DEFAULT_SKINS = [
  { id: "gold-pieces", name: "Fichas Doradas", type: "pieces", price: 2.99, colors: { primary: "#ffd700", secondary: "#b8860b", accent: "#fff8dc" } },
  { id: "crystal-pieces", name: "Fichas de Cristal", type: "pieces", price: 3.99, colors: { primary: "#87ceeb", secondary: "#4682b4", accent: "#e0f7fa" } },
  { id: "marble-board", name: "Tablero Mármol", type: "board", price: 2.99, colors: { primary: "#f5f5f0", secondary: "#d4cfc4" } },
  { id: "dark-wood", name: "Tablero Roble Oscuro", type: "board", price: 1.99, colors: { primary: "#4a3728", secondary: "#2c1810" } },
  { id: "neon-pieces", name: "Fichas Neón", type: "pieces", price: 4.99, colors: { primary: "#ff00ff", secondary: "#00ffff", accent: "#ffff00" } },
];

async function seedSkins() {
  for (const skin of DEFAULT_SKINS) {
    await Skin.findOneAndUpdate({ id: skin.id }, skin, { upsert: true });
  }
  console.log(`Seeded ${DEFAULT_SKINS.length} skins`);
}

const app = new Hono();
app.use("*", logger());
app.use("*", cors());

app.route("/api/auth", authRouter);
app.route("/api/rooms", roomsRouter);
app.route("/api/game", gameRouter);
app.route("/api/ranking", rankingRouter);
app.route("/api/payments", paymentsRouter);

app.get("/health", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT) || 3000;

connectDB().then(async () => {
  await seedSkins();
  serve({ fetch: app.fetch, port });
  console.log(`Backend running on port ${port}`);
});
