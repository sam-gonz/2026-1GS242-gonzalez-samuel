export type Piece = "r" | "b" | "rk" | "bk";
export type Board = (Piece | null)[][];
export type Color = "red" | "black";

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) continue;
      if (row < 3) board[row][col] = "r";
      else if (row > 4) board[row][col] = "b";
    }
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((r) => [...r]);
}

export function getPieceColor(piece: Piece): Color {
  return piece === "r" || piece === "rk" ? "red" : "black";
}

export function isKing(piece: Piece): boolean {
  return piece === "rk" || piece === "bk";
}

export function isEnemy(piece: Piece, color: Color): boolean {
  return getPieceColor(piece) !== color;
}
