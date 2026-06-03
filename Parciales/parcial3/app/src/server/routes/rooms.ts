import { Hono } from "hono";
import { customAlphabet } from "nanoid";
import Room from "../models/room.model";
import Game from "../models/game.model";
import { newGame } from "../engine/game";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

const router = new Hono();

router.get("/:code", async (c) => {
  try {
    const code = c.req.param("code").toUpperCase();
    const room = await Room.findOne({ code });
    if (!room) return c.json({ error: "Room not found" }, 404);
    return c.json(room);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.post("/", async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);

    const code = nanoid();
    const playerId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 12)();

    const room = new Room({
      code,
      players: [{ id: playerId, name, color: "red" }],
      status: "waiting",
    });

    await room.save();

    return c.json({ code, playerId, room }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.post("/:code/join", async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);

    const code = c.req.param("code").toUpperCase();
    const room = await Room.findOne({ code });
    if (!room) return c.json({ error: "Room not found" }, 404);
    if (room.status !== "waiting")
      return c.json({ error: "Game already started" }, 400);
    if (room.players.length >= 2)
      return c.json({ error: "Room is full" }, 400);

    const playerId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 12)();
    room.players.push({ id: playerId, name, color: "black" });
    room.status = "playing";
    await room.save();

    const gameState = newGame();
    const game = new Game({
      roomCode: room.code,
      board: gameState.board,
      turn: gameState.turn,
      players: [
        { id: room.players[0].id, color: "red" },
        { id: playerId, color: "black" },
      ],
    });
    await game.save();

    return c.json({ code: room.code, playerId, room }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.post("/bot", async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name) return c.json({ error: "Name is required" }, 400);

    const code = nanoid();
    const playerId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 12)();
    const botId = "bot_" + customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 12)();

    const room = new Room({
      code,
      players: [
        { id: playerId, name, color: "red" },
        { id: botId, name: "Máquina", color: "black" },
      ],
      status: "playing",
    });
    await room.save();

    const gameState = newGame();
    const game = new Game({
      roomCode: code,
      board: gameState.board,
      turn: gameState.turn,
      players: [
        { id: playerId, color: "red" },
        { id: botId, color: "black" },
      ],
    });
    await game.save();

    return c.json({ code, playerId, botId, room }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.delete("/:code", async (c) => {
  try {
    const code = c.req.param("code").toUpperCase();
    const room = await Room.findOne({ code });
    if (!room) return c.json({ error: "Room not found" }, 404);
    if (room.status !== "waiting")
      return c.json({ error: "Cannot cancel room in progress" }, 400);

    await Room.deleteOne({ code });
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default router;
