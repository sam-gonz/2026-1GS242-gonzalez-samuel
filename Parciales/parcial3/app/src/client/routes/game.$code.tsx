import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Board, { MoveAction } from "../components/Board";
import GameInfo from "../components/GameInfo";
import GameOverOverlay from "../components/GameOverOverlay";
import "../styles/board.css";

interface GameData {
  board: (string | null)[][];
  turn: string;
  status: string;
  players: Array<{ id: string; color: string }>;
  moveHistory: Array<{ from: number[]; to: number[]; captured?: number[] }>;
}

export default function Game() {
  const { code } = useParams();
  const [game, setGame] = useState<GameData | null>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<MoveAction[]>([]);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);

  const playerId = code ? localStorage.getItem(`player_${code}`) : null;
  const playerColor =
    game?.players.find((p) => p.id === playerId)?.color ?? null;
  const isBotGame = game?.players.some((p) => p.id.startsWith("bot_")) ?? false;
  const isBotTurn = isBotGame && game?.status === "active" && playerColor !== game?.turn;

  const fetchGame = useCallback(async () => {
    if (!code) return;
    try {
      const res = await fetch(`/api/game/${code}`);
      if (!res.ok) return;
      const data = await res.json();
      setGame(data);
    } catch {
      // ignore
    }
  }, [code]);

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  const fetchValidMoves = async (row: number, col: number) => {
    if (!code) return;
    try {
      const res = await fetch(`/api/game/${code}/actions?row=${row}&col=${col}`);
      if (!res.ok) return;
      const data = await res.json();
      setValidMoves(data.actions);
    } catch {
      // ignore
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!game || game.status !== "active") return;
    if (playerColor !== game.turn) return;
    if (moving) return;

    const piece = game.board[row][col];

    if (piece) {
      const isRed = piece === "r" || piece === "rk";
      const isMine = (playerColor === "red" && isRed) ||
                     (playerColor === "black" && !isRed);

      if (isMine) {
        setSelectedPos([row, col]);
        setValidMoves([]);
        fetchValidMoves(row, col);
        return;
      }
    }

    if (selectedPos) {
      const hasMove = validMoves.some((action) => {
        const lastStep = action.steps[action.steps.length - 1];
        return lastStep.to[0] === row && lastStep.to[1] === col;
      });

      if (hasMove && code) {
        setMoving(true);
        try {
          const res = await fetch(`/api/game/${code}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId,
              from: [selectedPos[0], selectedPos[1]],
              to: [row, col],
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            setError(data.error);
          } else {
            setGame(data.game);
            setSelectedPos(null);
            setValidMoves([]);
            setError("");
          }
        } catch {
          setError("Error de conexión");
        } finally {
          setMoving(false);
        }
      }
    }
  };

  const handleResign = async () => {
    if (!code) return;
    setMoving(true);
    try {
      const res = await fetch(`/api/game/${code}/resign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (res.ok) setGame(data.game);
    } finally {
      setMoving(false);
    }
  };

  if (!game) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <div className="loading-text">Cargando partida...</div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Damas</h1>
        <div className="sala-code">Sala {code}</div>
      </div>

      <div className="game-content">
        <Board
          board={game.board}
          selectedPos={selectedPos}
          validMoves={validMoves}
          playerColor={playerColor}
          flipped={playerColor === 'red'}
          onCellClick={handleCellClick}
        />

        <div className="game-sidebar">
          {isBotTurn && (
            <div className="bot-thinking">
              <div className="bot-thinking-spinner" />
              <span>Máquina pensando...</span>
            </div>
          )}

          <GameInfo
            turn={game.turn}
            status={game.status}
            playerColor={playerColor}
            moveCount={game.moveHistory.length}
            isBotGame={isBotGame}
            onResign={handleResign}
          />

          <div className="game-panel">
            <div className="panel-title">Historial</div>
            <div className="move-history">
              {game.moveHistory.length === 0 ? (
                <div className="history-empty">Sin movimientos aún</div>
              ) : (
                game.moveHistory.map((move, i) => (
                  <div key={i} className="move-entry">
                    <span className="move-number">{i + 1}.</span>
                    <span className="move-desc">
                      ({move.from[0]},{move.from[1]})→({move.to[0]},{move.to[1]})
                      {move.captured && move.captured.length > 0 && (
                        <span className="captured-mark">×</span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {game.status !== "active" && (
        <GameOverOverlay
          status={game.status}
          playerColor={playerColor}
          moveCount={game.moveHistory.length}
        />
      )}
    </div>
  );
}
