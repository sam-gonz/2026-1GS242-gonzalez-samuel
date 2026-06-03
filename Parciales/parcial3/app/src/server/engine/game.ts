import { Board, Color, createInitialBoard } from "./board";
import { MoveAction, getAllActions, getActionsForPiece } from "./moves";
import { executeAction, checkGameOver } from "./rules";

export interface GameState {
  board: Board;
  turn: Color;
  status: "active" | "red_wins" | "black_wins" | "draw";
}

export function newGame(): GameState {
  return {
    board: createInitialBoard(),
    turn: "red",
    status: "active",
  };
}

export function getValidActions(state: GameState): MoveAction[] {
  if (state.status !== "active") return [];
  return getAllActions(state.board, state.turn);
}

export function getPieceActions(state: GameState, row: number, col: number): MoveAction[] {
  if (state.status !== "active") return [];
  return getActionsForPiece(state.board, row, col);
}

export function isValidAction(state: GameState, action: MoveAction): boolean {
  const valid = getValidActions(state);
  return valid.some((a) => actionsEqual(a, action));
}

function actionsEqual(a: MoveAction, b: MoveAction): boolean {
  if (a.steps.length !== b.steps.length) return false;
  for (let i = 0; i < a.steps.length; i++) {
    if (!stepEqual(a.steps[i], b.steps[i])) return false;
  }
  return true;
}

function stepEqual(
  a: { from: [number, number]; to: [number, number] },
  b: { from: [number, number]; to: [number, number] }
): boolean {
  return (
    a.from[0] === b.from[0] &&
    a.from[1] === b.from[1] &&
    a.to[0] === b.to[0] &&
    a.to[1] === b.to[1]
  );
}

export function applyAction(state: GameState, action: MoveAction): GameState {
  if (state.status !== "active") return state;

  const newBoard = executeAction(state.board, action);
  const nextTurn: Color = state.turn === "red" ? "black" : "red";
  const gameOver = checkGameOver(newBoard, nextTurn);

  let status: GameState["status"] = "active";
  if (gameOver.over) {
    status = gameOver.winner === "red" ? "red_wins" : "black_wins";
  }

  return {
    board: newBoard,
    turn: nextTurn,
    status,
  };
}

export function findActionByDest(
  actions: MoveAction[],
  from: [number, number],
  to: [number, number]
): MoveAction | null {
  for (const action of actions) {
    const firstStep = action.steps[0];
    const lastStep = action.steps[action.steps.length - 1];
    if (
      firstStep.from[0] === from[0] &&
      firstStep.from[1] === from[1] &&
      lastStep.to[0] === to[0] &&
      lastStep.to[1] === to[1]
    ) {
      return action;
    }
  }
  return null;
}
