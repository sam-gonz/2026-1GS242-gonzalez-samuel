import { Board, Piece, Color, getPieceColor, isKing, isEnemy } from "./board";

export interface MoveStep {
  from: [number, number];
  to: [number, number];
  captured: [number, number] | null;
}

export interface MoveAction {
  steps: MoveStep[];
}

export interface MoveResult {
  from: [number, number];
  to: [number, number];
}

const KING_DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

function inBounds(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function getDirections(piece: Piece, allowBack: boolean = false): [number, number][] {
  if (isKing(piece) || allowBack) return KING_DIRECTIONS;
  return getPieceColor(piece) === "red" ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
}

export function getAllActions(board: Board, color: Color): MoveAction[] {
  let actions: MoveAction[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || getPieceColor(p) !== color) continue;
      actions.push(...getCaptureActions(board, r, c));
    }
  if (actions.length > 0) return actions;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || getPieceColor(p) !== color) continue;
      const dirs = getDirections(p);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc] === null)
          actions.push({ steps: [{ from: [r, c], to: [nr, nc], captured: null }] });
      }
    }
  return actions;
}

function getCaptures(board: Board, r: number, c: number, back: boolean = false): MoveStep[] {
  const p = board[r][c];
  if (!p) return [];
  const res: MoveStep[] = [];
  const color = getPieceColor(p);
  for (const [dr, dc] of getDirections(p, back)) {
    const mr = r + dr, mc = c + dc, lr = r + 2 * dr, lc = c + 2 * dc;
    if (!inBounds(mr, mc) || !inBounds(lr, lc)) continue;
    if (board[mr][mc] && isEnemy(board[mr][mc]!, color) && board[lr][lc] === null)
      res.push({ from: [r, c], to: [lr, lc], captured: [mr, mc] });
  }
  return res;
}

function getCaptureActions(board: Board, r: number, c: number): MoveAction[] {
  const caps = getCaptures(board, r, c, false);
  if (caps.length === 0) return [];
  const res: MoveAction[] = [];
  for (const s of caps) {
    const nb = applyMove(board, s);
    const chains = getChains(nb, s.to[0], s.to[1], !isKing(board[r][c]!));
    if (chains.length === 0) res.push({ steps: [s] });
    else for (const ch of chains) res.push({ steps: [s, ...ch] });
  }
  return res;
}

function getChains(board: Board, r: number, c: number, back: boolean): MoveStep[][] {
  const more = getCaptures(board, r, c, back);
  if (more.length === 0) return [[]];
  const chains: MoveStep[][] = [];
  for (const s of more) {
    const nb = applyMove(board, s);
    for (const sub of getChains(nb, s.to[0], s.to[1], true))
      chains.push([s, ...sub]);
  }
  return chains;
}

function applyMove(board: Board, step: MoveStep): Board {
  const b = board.map((r) => [...r]);
  b[step.to[0]][step.to[1]] = b[step.from[0]][step.from[1]];
  b[step.from[0]][step.from[1]] = null;
  if (step.captured) b[step.captured[0]][step.captured[1]] = null;
  return b;
}

export function executeAction(board: Board, action: MoveAction): Board {
  let cur = board;
  for (const s of action.steps) {
    const nb = cur.map((r) => [...r]);
    const p = nb[s.from[0]][s.from[1]]!;
    let fp: Piece = p;
    if (!isKing(p) && ((getPieceColor(p) === "red" && s.to[0] === 7) || (getPieceColor(p) === "black" && s.to[0] === 0)))
      fp = p === "r" ? "rk" : "bk";
    nb[s.to[0]][s.to[1]] = fp;
    nb[s.from[0]][s.from[1]] = null;
    if (s.captured) nb[s.captured[0]][s.captured[1]] = null;
    cur = nb;
  }
  return cur;
}

export function toMoveResult(action: MoveAction): MoveResult {
  return { from: action.steps[0].from, to: action.steps[action.steps.length - 1].to };
}
