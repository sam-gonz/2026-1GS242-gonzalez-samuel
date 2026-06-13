import { Hono } from "hono";
import Game from "../models/game.model";
import Ranking from "../models/ranking.model";
import { GameState, getValidActions, getPieceActions, applyAction, findActionByDest } from "../engine/game";
import { Board } from "../engine/board";

const AI_URL = process.env.AI_URL || "http://localhost:3001";

const router = new Hono();

function toGameState(game: any): GameState {
  return {
    board: game.board as Board,
    turn: game.turn as "red" | "black",
    status: game.status as GameState["status"],
  };
}

import User from "../models/user.model";

async function updateRanking(clerkId: string, won: boolean, moves: number) {
  if (!clerkId || clerkId.startsWith("bot_")) return;
  const user = await User.findOne({ clerkId });
  await Ranking.findOneAndUpdate(
    { clerkId },
    { $inc: { wins: won ? 1 : 0, losses: won ? 0 : 1, totalGames: 1, totalMoves: moves }, $set: { name: user?.name || clerkId } },
    { upsert: true, new: true }
  );
}

async function callAIService(state: GameState, difficulty?: string): Promise<{ from: number[]; to: number[] } | null> {
  try {
    const res = await fetch(`${AI_URL}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: state.board, turn: state.turn, status: state.status, difficulty: difficulty || "normal" }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

router.get("/:code", async (c) => {
  try {
    const game = await Game.findOne({ roomCode: c.req.param("code").toUpperCase() });
    if (!game) return c.json({ error: "Game not found" }, 404);
    return c.json(game);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.get("/:code/actions", async (c) => {
  try {
    const game = await Game.findOne({ roomCode: c.req.param("code").toUpperCase() });
    if (!game) return c.json({ error: "Game not found" }, 404);
    const row = parseInt(c.req.query("row") || "");
    const col = parseInt(c.req.query("col") || "");
    const state = toGameState(game);
    if (!isNaN(row) && !isNaN(col)) return c.json({ actions: getPieceActions(state, row, col) });
    return c.json({ actions: getValidActions(state) });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/:code/move", async (c) => {
  try {
    const { playerId, from, to } = await c.req.json();
    if (!playerId || !from || !to) return c.json({ error: "playerId, from, to required" }, 400);
    const fromArr: [number, number] = [from[0], from[1]];
    const toArr: [number, number] = [to[0], to[1]];
    const game = await Game.findOne({ roomCode: c.req.param("code").toUpperCase() });
    if (!game) return c.json({ error: "Game not found" }, 404);
    if (game.status !== "active") return c.json({ error: "Game is over" }, 400);
    const player = game.players.find((p: any) => p.id === playerId);
    if (!player) return c.json({ error: "Player not in game" }, 403);
    if (player.color !== game.turn) return c.json({ error: "Not your turn" }, 400);

    const state = toGameState(game);
    const action = findActionByDest(getValidActions(state), fromArr, toArr);
    if (!action) return c.json({ error: "Invalid move" }, 400);

    const newState = applyAction(state, action);
    game.board = newState.board as any;
    game.turn = newState.turn;
    game.status = newState.status;

    for (const step of action.steps) {
      const piece = state.board[step.from[0]][step.from[1]];
      const wasKing = piece === "rk" || piece === "bk";
      const reachedLastRow = (state.turn === "red" && step.to[0] === 7) || (state.turn === "black" && step.to[0] === 0);
      game.moveHistory.push({
        from: step.from, to: step.to, captured: step.captured || undefined,
        promoted: !wasKing && reachedLastRow, player: playerId,
      });
    }

    if (game.gameMode === "rush" && game.timeLimit) {
      const now = Date.now();
      const lastMoveTime = game.updatedAt.getTime();
      const elapsed = Math.floor((now - lastMoveTime) / 1000);
      if (player.color === "red") {
        game.redTimeRemaining = Math.max(0, (game.redTimeRemaining || 0) - elapsed);
        if (game.redTimeRemaining <= 0) {
          game.status = "black_wins";
        }
      } else {
        game.blackTimeRemaining = Math.max(0, (game.blackTimeRemaining || 0) - elapsed);
        if (game.blackTimeRemaining <= 0) {
          game.status = "red_wins";
        }
      }
    }

    await game.save();

    const nextPlayer = game.players.find((p: any) => p.color === game.turn);
    const isAITurn = nextPlayer?.id.startsWith("bot_");

    if (game.status === "active" && isAITurn) {
      await new Promise((r) => setTimeout(r, 600));
      const aiResult = await callAIService(toGameState(game), game.difficulty);
      if (aiResult) {
        const aiAction = findActionByDest(
          getValidActions(toGameState(game)),
          [aiResult.from[0], aiResult.from[1]],
          [aiResult.to[0], aiResult.to[1]]
        );
        if (aiAction) {
          const aiNewState = applyAction(toGameState(game), aiAction);
          game.board = aiNewState.board as any;
          game.turn = aiNewState.turn;
          game.status = aiNewState.status;
          for (const step of aiAction.steps) {
            const piece = state.board[step.from[0]][step.from[1]];
            const wasKing = piece === "rk" || piece === "bk";
            const reachedLastRow = (state.turn === "red" && step.to[0] === 7) || (state.turn === "black" && step.to[0] === 0);
            game.moveHistory.push({
              from: step.from, to: step.to, captured: step.captured || undefined,
              promoted: !wasKing && reachedLastRow, player: nextPlayer.id,
            });
          }
          await game.save();
        }
      }
    }

    if (game.status !== "active") {
      for (const p of game.players) {
        const playerMoves = game.moveHistory.filter((m: any) => m.player === p.id).length;
        await updateRanking(p.clerkId || "", game.status === (p.color === "red" ? "red_wins" : "black_wins"), playerMoves);
      }
    }

    return c.json({ game });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/:code/resign", async (c) => {
  try {
    const { playerId } = await c.req.json();
    if (!playerId) return c.json({ error: "playerId required" }, 400);
    const game = await Game.findOne({ roomCode: c.req.param("code").toUpperCase() });
    if (!game) return c.json({ error: "Game not found" }, 404);
    if (game.status !== "active") return c.json({ error: "Game over" }, 400);
    const player = game.players.find((p: any) => p.id === playerId);
    if (!player) return c.json({ error: "Not in game" }, 403);
    game.status = player.color === "red" ? "black_wins" : "red_wins";
    await game.save();

    for (const p of game.players) {
      const playerMoves = game.moveHistory.filter((m: any) => m.player === p.id).length;
      await updateRanking(p.clerkId || "", game.status === (p.color === "red" ? "red_wins" : "black_wins"), playerMoves);
    }
    return c.json({ game });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

export default router;
