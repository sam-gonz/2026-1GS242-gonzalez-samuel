import Piece from "./Piece";

export interface MoveStep {
  from: [number, number];
  to: [number, number];
  captured: [number, number] | null;
}

export interface MoveAction {
  steps: MoveStep[];
}

interface BoardProps {
  board: (string | null)[][];
  selectedPos: [number, number] | null;
  validMoves: MoveAction[];
  playerColor: string | null;
  flipped: boolean;
  onCellClick: (row: number, col: number) => void;
}

export default function Board({ board, selectedPos, validMoves, playerColor, flipped, onCellClick }: BoardProps) {
  const displayBoard = flipped ? [...board].reverse() : board;

  const isValidDest = (row: number, col: number): boolean => {
    if (!selectedPos) return false;
    return validMoves.some((action) => {
      const lastStep = action.steps[action.steps.length - 1];
      return lastStep.to[0] === row && lastStep.to[1] === col;
    });
  };

  const isCaptureDest = (row: number, col: number): boolean => {
    if (!selectedPos) return false;
    return validMoves.some((action) => {
      const lastStep = action.steps[action.steps.length - 1];
      return lastStep.to[0] === row && lastStep.to[1] === col && lastStep.captured;
    });
  };

  const isPlayable = (pieceType: string | null): boolean => {
    if (!pieceType || !playerColor) return false;
    const isRed = pieceType === "r" || pieceType === "rk";
    return (playerColor === "red" && isRed) || (playerColor === "black" && !isRed);
  };

  const handleCellClick = (displayRow: number, col: number) => {
    const actualRow = flipped ? 7 - displayRow : displayRow;
    const piece = board[actualRow][col];
    if (piece && isPlayable(piece)) {
      onCellClick(actualRow, col);
      return;
    }
    onCellClick(actualRow, col);
  };

  return (
    <div className="board-wrapper">
      <div className="board">
        {displayBoard.map((row, r) =>
          row.map((cell, c) => {
            const actualRow = flipped ? 7 - r : r;
            const isDark = (actualRow + c) % 2 !== 0;
            const isSelected = selectedPos?.[0] === actualRow && selectedPos?.[1] === c;
            const canMoveHere = isValidDest(actualRow, c);
            const isCapture = isCaptureDest(actualRow, c);

            let cellClass = "cell";
            cellClass += isDark ? " dark" : " light";
            if (isSelected) cellClass += " selected";
            if (canMoveHere) cellClass += isCapture ? " highlight-capture" : " highlight-valid";

            return (
              <div
                key={`${actualRow}-${c}`}
                className={cellClass}
                onClick={() => handleCellClick(r, c)}
              >
                {cell && (
                  <Piece
                    type={cell}
                    selected={isSelected}
                    playable={isPlayable(cell)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
