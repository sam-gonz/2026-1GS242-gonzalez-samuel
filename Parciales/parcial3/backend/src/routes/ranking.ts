import { Hono } from "hono";
import Ranking from "../models/ranking.model";
import Game from "../models/game.model";

const router = new Hono();

router.get("/", async (c) => {
  try {
    const rankings = await Ranking.find().sort({ wins: -1, totalMoves: 1 }).limit(50);
    return c.json(rankings);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.get("/me", async (c) => {
  try {
    const clerkId = c.req.query("clerkId");
    if (!clerkId) return c.json({ error: "clerkId required" }, 400);
    const rank = await Ranking.findOne({ clerkId });
    if (!rank) return c.json({ wins: 0, losses: 0, totalGames: 0, totalMoves: 0 });
    return c.json(rank);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.get("/history", async (c) => {
  try {
    const clerkId = c.req.query("clerkId");
    if (!clerkId) return c.json({ error: "clerkId required" }, 400);
    const games = await Game.find({ "players.clerkId": clerkId })
      .sort({ createdAt: -1 }).limit(20).select("roomCode players status moveHistory createdAt");
    const history = games.map(g => {
      const me = g.players.find(p => p.clerkId === clerkId);
      const them = g.players.find(p => p.clerkId !== clerkId);
      const myColor = me?.color;
      const won = g.status === "red_wins" && myColor === "red" || g.status === "black_wins" && myColor === "black";
      const moves = g.moveHistory.filter(m => m.player === me?.id).length;
      return {
        roomCode: g.roomCode,
        opponentName: them?.id?.startsWith("bot_") ? "Maquina" : them?.clerkId || "Desconocido",
        myColor,
        result: g.status === "draw" ? "draw" : won ? "win" : "loss",
        moves,
        date: g.createdAt,
      };
    });
    return c.json(history);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

export default router;
