import { Hono } from "hono";
import { customAlphabet } from "nanoid";
import Room from "../models/room.model";
import Game from "../models/game.model";
import { newGame } from "../engine/game";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
const idGen = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 12);
const router = new Hono();

router.get("/:code", async (c) => {
  try {
    const room = await Room.findOne({ code: c.req.param("code").toUpperCase() });
    if (!room) return c.json({ error: "Room not found" }, 404);
    return c.json(room);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/", async (c) => {
  try {
    const { name, clerkId } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);
    const code = nanoid();
    const playerId = idGen();
    const room = new Room({
      code, players: [{ id: playerId, name, color: "red", clerkId }], status: "waiting",
    });
    await room.save();
    return c.json({ code, playerId, room }, 201);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/:code/join", async (c) => {
  try {
    const { name, clerkId } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);
    const code = c.req.param("code").toUpperCase();
    const room = await Room.findOne({ code });
    if (!room) return c.json({ error: "Room not found" }, 404);
    if (room.status !== "waiting") return c.json({ error: "Game already started" }, 400);
    if (room.players.length >= 2) return c.json({ error: "Room is full" }, 400);
    const playerId = idGen();
    room.players.push({ id: playerId, name, color: "black", clerkId });
    room.status = "playing";
    await room.save();
    const gs = newGame();
    const game = new Game({
      roomCode: room.code, board: gs.board, turn: gs.turn,
      players: [
        { id: room.players[0].id, color: "red", clerkId: room.players[0].clerkId },
        { id: playerId, color: "black", clerkId },
      ],
    });
    await game.save();
    return c.json({ code: room.code, playerId, room }, 201);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/bot", async (c) => {
  try {
    const { name, clerkId, difficulty, gameMode, timeLimit } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);
    const validDifficulties = ["easy", "normal", "hard", "expert"];
    const diff = validDifficulties.includes(difficulty) ? difficulty : "normal";
    const mode = gameMode === "rush" ? "rush" : "classic";
    const time = mode === "rush" ? (timeLimit || 300) : null;
    const code = nanoid();
    const playerId = idGen();
    const botId = "bot_" + idGen();
    const room = new Room({
      code, status: "playing",
      players: [
        { id: playerId, name, color: "red", clerkId },
        { id: botId, name: "Máquina", color: "black" },
      ],
    });
    await room.save();
    const gs = newGame();
    const game = new Game({
      roomCode: code, board: gs.board, turn: gs.turn,
      difficulty: diff,
      gameMode: mode,
      timeLimit: time,
      redTimeRemaining: time,
      blackTimeRemaining: time,
      players: [
        { id: playerId, color: "red", clerkId },
        { id: botId, color: "black" },
      ],
    });
    await game.save();
    return c.json({ code, playerId, botId, room }, 201);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.delete("/:code", async (c) => {
  try {
    const code = c.req.param("code").toUpperCase();
    await Room.deleteOne({ code });
    return c.json({ ok: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

export default router;
