import { serve } from "bun";
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();
app.use("*", logger());

import { Board, Color, createInitialBoard } from "./board";
import { getAllActions, executeAction, toMoveResult } from "./moves";
import { getBestMove, Difficulty } from "./minimax";

app.post("/move", async (c) => {
  try {
    const { board, turn, status, difficulty } = await c.req.json() as {
      board: (string | null)[][];
      turn: string;
      status: string;
      difficulty?: string;
    };

    if (status !== "active") return c.json({ error: "Game over" }, 400);

    const diff: Difficulty = (["easy", "normal", "hard", "expert"].includes(difficulty ?? "") ? difficulty : "normal") as Difficulty;
    const action = getBestMove(board as Board, turn as Color, diff);
    if (!action) return c.json({ error: "No moves" }, 400);

    return c.json(toMoveResult(action));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/health", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT) || 3001;
console.log(`AI Service running on port ${port}`);
serve({ fetch: app.fetch, port });
