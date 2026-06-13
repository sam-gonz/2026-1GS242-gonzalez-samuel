import { Board, Piece, Color, getPieceColor, isKing } from "./board";
import { MoveAction, MoveStep, getAllActions } from "./moves";

export function isPromotion(piece: Piece, toRow: number): boolean {
  if (isKing(piece)) return false;
  const color = getPieceColor(piece);
  return (color === "red" && toRow === 7) || (color === "black" && toRow === 0);
}

export function promotePiece(piece: Piece): Piece {
  return piece === "r" ? "rk" : "bk";
}

export function applyStep(board: Board, step: MoveStep): Board {
  const newBoard = board.map((r) => [...r]);
  const piece = newBoard[step.from[0]][step.from[1]];
  if (!piece) throw new Error("No piece at source");
  let finalPiece = piece;
  if (isPromotion(piece, step.to[0])) finalPiece = promotePiece(piece);
  newBoard[step.to[0]][step.to[1]] = finalPiece;
  newBoard[step.from[0]][step.from[1]] = null;
  if (step.captured) newBoard[step.captured[0]][step.captured[1]] = null;
  return newBoard;
}

export function executeAction(board: Board, action: MoveAction): Board {
  let current = board;
  for (const step of action.steps) current = applyStep(current, step);
  return current;
}

export function checkGameOver(board: Board, color: Color): { over: boolean; winner: Color | null } {
  const valid = getAllActions(board, color);
  if (valid.length > 0) return { over: false, winner: null };
  const opponent: Color = color === "red" ? "black" : "red";
  return { over: true, winner: opponent };
}
