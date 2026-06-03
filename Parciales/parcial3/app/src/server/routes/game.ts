import { Hono } from "hono";
import Game from "../models/game.model";
import { GameState, getValidActions, getPieceActions, applyAction, findActionByDest } from "../engine/game";
import { Board } from "../engine/board";

const router = new Hono();

function toGameState(game: any): GameState {
  return {
    board: game.board as Board,
    turn: game.turn as "red" | "black",
    status: game.status as GameState["status"],
  };
}

function codeParam(c: any): string {
  return c.req.param("code").toUpperCase();
}

function isBot(game: any): boolean {
  const next = game.players.find((p: any) => p.color === game.turn);
  return next?.id.startsWith("bot_");
}

async function executeBotTurn(game: any): Promise<any> {
  const state = toGameState(game);
  const actions = getValidActions(state);
  if (actions.length === 0) return game;

  const action = actions[Math.floor(Math.random() * actions.length)];
  const newState = applyAction(state, action);
  const botPlayer = game.players.find((p: any) => p.color === state.turn);

  game.board = newState.board as any;
  game.turn = newState.turn;
  game.status = newState.status;

  for (const step of action.steps) {
    const piece = state.board[step.from[0]][step.from[1]];
    const wasKing = piece === "rk" || piece === "bk";
    const reachedLastRow =
      (state.turn === "red" && step.to[0] === 7) ||
      (state.turn === "black" && step.to[0] === 0);
    const promoted = !wasKing && reachedLastRow;

    game.moveHistory.push({
      from: step.from,
      to: step.to,
      captured: step.captured || undefined,
      promoted,
      player: botPlayer?.id || "",
    });
  }

  await game.save();
  return game;
}

router.get("/:code", async (c) => {
  try {
    const game = await Game.findOne({ roomCode: codeParam(c) });
    if (!game) return c.json({ error: "Game not found" }, 404);
    return c.json(game);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.get("/:code/actions", async (c) => {
  try {
    const game = await Game.findOne({ roomCode: codeParam(c) });
    if (!game) return c.json({ error: "Game not found" }, 404);

    const row = parseInt(c.req.query("row") || "");
    const col = parseInt(c.req.query("col") || "");
    const state = toGameState(game);

    if (!isNaN(row) && !isNaN(col)) {
      const actions = getPieceActions(state, row, col);
      return c.json({ actions });
    }

    const actions = getValidActions(state);
    return c.json({ actions });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.post("/:code/move", async (c) => {
  try {
    const { playerId, from, to } = await c.req.json();
    if (!playerId || !from || !to)
      return c.json({ error: "playerId, from, and to are required" }, 400);

    const fromArr: [number, number] = [from[0], from[1]];
    const toArr: [number, number] = [to[0], to[1]];

    const game = await Game.findOne({ roomCode: codeParam(c) });
    if (!game) return c.json({ error: "Game not found" }, 404);
    if (game.status !== "active")
      return c.json({ error: "Game is over" }, 400);

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return c.json({ error: "Player not in this game" }, 403);
    if (player.color !== game.turn)
      return c.json({ error: "Not your turn" }, 400);

    const state = toGameState(game);

    const action = findActionByDest(
      getValidActions(state),
      fromArr,
      toArr
    );

    if (!action)
      return c.json({ error: "Invalid move" }, 400);

    const newState = applyAction(state, action);

    game.board = newState.board as any;
    game.turn = newState.turn;
    game.status = newState.status;

    for (const step of action.steps) {
      const piece = state.board[step.from[0]][step.from[1]];
      const wasKing = piece === "rk" || piece === "bk";
      const reachedLastRow =
        (state.turn === "red" && step.to[0] === 7) ||
        (state.turn === "black" && step.to[0] === 0);
      const promoted = !wasKing && reachedLastRow;

      game.moveHistory.push({
        from: step.from,
        to: step.to,
        captured: step.captured || undefined,
        promoted,
        player: playerId,
      });
    }

    await game.save();

    if (game.status === "active" && isBot(game)) {
      await new Promise((r) => setTimeout(r, 700));
      await executeBotTurn(game);
    }

    return c.json({ game });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.post("/:code/resign", async (c) => {
  try {
    const { playerId } = await c.req.json();
    if (!playerId) return c.json({ error: "playerId is required" }, 400);

    const game = await Game.findOne({ roomCode: codeParam(c) });
    if (!game) return c.json({ error: "Game not found" }, 404);
    if (game.status !== "active")
      return c.json({ error: "Game is already over" }, 400);

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return c.json({ error: "Player not in this game" }, 403);

    game.status = player.color === "red" ? "black_wins" : "red_wins";
    await game.save();

    return c.json({ game });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default router;
