import { Board, Piece, Color, getPieceColor, isKing, isEnemy } from "./board";

export interface MoveStep {
  from: [number, number];
  to: [number, number];
  captured: [number, number] | null;
}

export interface MoveAction {
  steps: MoveStep[];
}

const KING_DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 1],
  [1, -1], [1, 1],
];

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getDirections(piece: Piece): [number, number][] {
  if (isKing(piece)) return KING_DIRECTIONS;
  const color = getPieceColor(piece);
  return color === "red"
    ? [[1, -1], [1, 1]]
    : [[-1, -1], [-1, 1]];
}

export function getSimpleMoves(board: Board, row: number, col: number): MoveAction[] {
  const piece = board[row][col];
  if (!piece) return [];

  const actions: MoveAction[] = [];
  const dirs = getDirections(piece);

  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (!inBounds(nr, nc)) continue;
    if (board[nr][nc] !== null) continue;

    actions.push({
      steps: [{ from: [row, col], to: [nr, nc], captured: null }],
    });
  }

  return actions;
}

export function getCaptures(
  board: Board,
  row: number,
  col: number
): MoveStep[] {
  const piece = board[row][col];
  if (!piece) return [];

  const captures: MoveStep[] = [];
  const dirs = getDirections(piece);
  const color = getPieceColor(piece);

  for (const [dr, dc] of dirs) {
    const mr = row + dr;
    const mc = col + dc;
    const lr = row + 2 * dr;
    const lc = col + 2 * dc;

    if (!inBounds(mr, mc) || !inBounds(lr, lc)) continue;

    const midPiece = board[mr][mc];
    const landPiece = board[lr][lc];

    if (midPiece && isEnemy(midPiece, color) && landPiece === null) {
      captures.push({
        from: [row, col],
        to: [lr, lc],
        captured: [mr, mc],
      });
    }
  }

  return captures;
}

export function getCaptureActions(
  board: Board,
  row: number,
  col: number
): MoveAction[] {
  const initialCaptures = getCaptures(board, row, col);
  if (initialCaptures.length === 0) return [];

  const actions: MoveAction[] = [];

  for (const step of initialCaptures) {
    const newBoard = applyMove(board, step);
    const chains = getCaptureChains(newBoard, step.to[0], step.to[1]);

    if (chains.length === 0) {
      actions.push({ steps: [step] });
    } else {
      for (const chain of chains) {
        actions.push({ steps: [step, ...chain] });
      }
    }
  }

  return actions;
}

function getCaptureChains(
  board: Board,
  row: number,
  col: number
): MoveStep[][] {
  const more = getCaptures(board, row, col);
  if (more.length === 0) return [[]];

  const chains: MoveStep[][] = [];

  for (const step of more) {
    const newBoard = applyMove(board, step);
    const subChains = getCaptureChains(newBoard, step.to[0], step.to[1]);
    for (const sub of subChains) {
      chains.push([step, ...sub]);
    }
  }

  return chains;
}

export function getAllActions(board: Board, color: Color): MoveAction[] {
  let actions: MoveAction[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || getPieceColor(piece) !== color) continue;

      const captures = getCaptureActions(board, row, col);
      if (captures.length > 0) {
        actions.push(...captures);
      }
    }
  }

  if (actions.length > 0) return actions;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || getPieceColor(piece) !== color) continue;
      actions.push(...getSimpleMoves(board, row, col));
    }
  }

  return actions;
}

export function getActionsForPiece(
  board: Board,
  row: number,
  col: number
): MoveAction[] {
  const piece = board[row][col];
  if (!piece) return [];

  const captures = getCaptureActions(board, row, col);
  if (captures.length > 0) return captures;

  return getSimpleMoves(board, row, col);
}

export function hasAnyValidMove(board: Board, color: Color): boolean {
  return getAllActions(board, color).length > 0;
}

function applyMove(board: Board, step: MoveStep): Board {
  const b = board.map((r) => [...r]);
  b[step.to[0]][step.to[1]] = b[step.from[0]][step.from[1]];
  b[step.from[0]][step.from[1]] = null;
  if (step.captured) {
    b[step.captured[0]][step.captured[1]] = null;
  }
  return b;
}
