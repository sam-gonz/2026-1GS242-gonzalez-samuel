import { Board, Color, Piece, getPieceColor, isKing, isEnemy, cloneBoard } from "./board";
import { getAllActions, executeAction, toMoveResult, MoveAction, MoveResult } from "./moves";

export type Difficulty = "easy" | "normal" | "hard" | "expert";

const CENTER_COLS = [2, 3, 4, 5];

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 2,
  normal: 4,
  hard: 6,
  expert: 8,
};

function aStarHeuristic(board: Board, color: Color): number {
  let score = 0;
  const promoRow = color === "red" ? 7 : 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || getPieceColor(p) !== color) continue;
      const king = isKing(p);
      if (king) {
        score += 20;
        continue;
      }
      const dist = Math.abs(r - promoRow);
      score += (7 - dist) * 3;
    }
  }

  const actions = getAllActions(board, color);
  score += actions.length * 2;

  const captureCount = actions.filter(a => a.steps.some(s => s.captured)).length;
  score += captureCount * 5;

  return score;
}

function positionalScore(board: Board, aiColor: Color): number {
  let score = 0;
  let enemyThreats = 0;
  let friendlyCenter = 0;
  let backRowDefense = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const color = getPieceColor(p);
      const king = isKing(p);
      const isAI = color === aiColor;
      const mult = isAI ? 1 : -1;

      if (king) {
        score += mult * 15;
      } else {
        score += mult * 10;
      }

      if (CENTER_COLS.includes(c)) {
        if (isAI) friendlyCenter += 2;
        else score += mult * 2;
      }

      if (isAI && !king) {
        const homeRow = aiColor === "red" ? 0 : 7;
        if (r === homeRow) backRowDefense += 1;
      }

      const oppColor: Color = aiColor === "red" ? "black" : "red";
      if (color === oppColor && !isAI) {
        const dirs = king
          ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
          : color === "red"
          ? [[1, -1], [1, 1]]
          : [[-1, -1], [-1, 1]];
        for (const [dr, dc] of dirs) {
          const mr = r + dr, mc = c + dc;
          const lr = r + 2 * dr, lc = c + 2 * dc;
          if (lr >= 0 && lr < 8 && lc >= 0 && lc < 8) {
            if (board[mr]?.[mc] && getPieceColor(board[mr][mc]!) === aiColor &&
                board[lr][lc] === null) {
              enemyThreats++;
            }
          }
        }
      }
    }
  }

  score -= enemyThreats * 3;
  score += friendlyCenter;
  score += backRowDefense;
  return score;
}

export function evaluate(board: Board, aiColor: Color, difficulty: Difficulty): number {
  const base = positionalScore(board, aiColor);
  if (difficulty === "easy") return base;

  const aStar = aStarHeuristic(board, aiColor);
  const oppColor: Color = aiColor === "red" ? "black" : "red";
  const oppAStar = aStarHeuristic(board, oppColor);

  if (difficulty === "normal") {
    return base + (aStar - oppAStar) * 0.5;
  }

  return base + (aStar - oppAStar) * 0.8;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: Color,
  difficulty: Difficulty
): number {
  if (depth === 0) return evaluate(board, aiColor, difficulty);

  const color: Color = isMaximizing ? aiColor : (aiColor === "red" ? "black" : "red");
  const actions = getAllActions(board, color);

  if (actions.length === 0) {
    return isMaximizing ? -99999 : 99999;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const action of actions) {
      const newBoard = executeAction(board, action);
      const score = minimax(newBoard, depth - 1, alpha, beta, false, aiColor, difficulty);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const action of actions) {
      const newBoard = executeAction(board, action);
      const score = minimax(newBoard, depth - 1, alpha, beta, true, aiColor, difficulty);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(board: Board, aiColor: Color, difficulty: Difficulty = "normal"): MoveAction | null {
  const actions = getAllActions(board, aiColor);
  if (actions.length === 0) return null;

  const depth = DEPTH_MAP[difficulty];

  if (difficulty === "easy" && Math.random() < 0.3) {
    return actions[Math.floor(Math.random() * actions.length)];
  }

  let bestAction: MoveAction | null = null;
  let bestScore = -Infinity;

  for (const action of actions) {
    const newBoard = executeAction(board, action);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, aiColor, difficulty);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}
