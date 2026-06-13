import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import "../../styles/globals.css";

interface MoveAction { steps: Array<{ from: number[]; to: number[]; captured: number[] | null }>; }

const CELL_SIZE = 68;

const boardColors: Record<string, { light: string; dark: string }> = {
  "marble-board": { light: "#f5f5f0", dark: "#d4cfc4" },
  "dark-wood":    { light: "#5d4e37", dark: "#2c1810" },
  "cherry-wood":  { light: "#a0522d", dark: "#5c2e0e" },
  "ocean-board":  { light: "#4da6c9", dark: "#003366" },
  "forest-board": { light: "#66bb6a", dark: "#006400" },
  "sunset-board": { light: "#ff8c69", dark: "#8b0000" },
  "galaxy-board": { light: "#4a0080", dark: "#000000" },
  "gold-board":   { light: "#ffd700", dark: "#b8860b" },
  "castle-board": { light: "#a89078", dark: "#5c4033" },
  "dungeon-board": { light: "#4a3c28", dark: "#1a1410" },
  "throne-board": { light: "#daa520", dark: "#8b6914" },
  "battlefield-board": { light: "#8fbc8f", dark: "#556b2f" },
  "tavern-board": { light: "#a0522d", dark: "#5c2e0e" },
};

const pieceSkins: Record<string, { red: string[]; black: string[] }> = {
  "knight-pieces":    { red: ["#a0522d", "#8b7355", "#d4af37"], black: ["#5c4033", "#3d2817", "#8b7355"] },
  "royal-pieces":     { red: ["#ffd700", "#daa520", "#fff8dc"], black: ["#b8860b", "#8b6914", "#ffd700"] },
  "crusader-pieces":  { red: ["#f5f5dc", "#ffffff", "#8b0000"], black: ["#8b0000", "#4a0000", "#ffffff"] },
  "dark-knight-pieces": { red: ["#4a0000", "#2d2418", "#8b0000"], black: ["#1a1410", "#0d0a08", "#4a0000"] },
  "viking-pieces":    { red: ["#4682b4", "#2c5f7c", "#c0c0c0"], black: ["#2c5f7c", "#1a3a4a", "#c0c0c0"] },
  "dragon-pieces":    { red: ["#ff4500", "#8b0000", "#ffa500"], black: ["#4a0000", "#2d0000", "#ff4500"] },
  "gold-pieces":    { red: ["#ffd700", "#b8860b", "#fff8dc"], black: ["#b8860b", "#8b6914", "#fff8dc"] },
  "crystal-pieces": { red: ["#87ceeb", "#4682b4", "#e0f7fa"], black: ["#4682b4", "#2c5f7c", "#e0f7fa"] },
  "ruby-pieces":    { red: ["#e0115f", "#9b111e", "#ffb6c1"], black: ["#9b111e", "#6b0000", "#ffb6c1"] },
  "emerald-pieces": { red: ["#50c878", "#228b22", "#98fb98"], black: ["#228b22", "#006400", "#98fb98"] },
  "obsidian-pieces":{ red: ["#666666", "#3d3d3d", "#999999"], black: ["#3d3d3d", "#1a1a1a", "#666666"] },
  "neon-pieces":    { red: ["#ff00ff", "#cc00cc", "#ffff00"], black: ["#00ffff", "#00cccc", "#ffff00"] },
  "fire-pieces":    { red: ["#ff4500", "#8b0000", "#ffa500"], black: ["#8b0000", "#4a0000", "#ffa500"] },
  "ice-pieces":     { red: ["#b0e0e6", "#4682b4", "#ffffff"], black: ["#4682b4", "#2c5f7c", "#ffffff"] },
};

export default function Game() {
  const { code } = useParams({ from: "/game/$code" });
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [selectedPos, setSelectedPos] = useState<number[] | null>(null);
  const [validMoves, setValidMoves] = useState<MoveAction[]>([]);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);
  const [activeSkin, setActiveSkin] = useState<{ pieces?: string; board?: string }>({});

  const clerkId = typeof window !== "undefined" ? localStorage.getItem("clerkId") : null;
  const playerId = code ? localStorage.getItem(`player_${code}`) : null;
  const playerColor = game?.players.find((p: any) => p.id === playerId)?.color ?? null;
  const isBotGame = game?.players.some((p: any) => p.id.startsWith("bot_")) ?? false;
  const isBotTurn = isBotGame && game?.status === "active" && playerColor !== game?.turn;

  const boardSkin = activeSkin.board ? boardColors[activeSkin.board] : null;
  const pieceSkin = activeSkin.pieces ? pieceSkins[activeSkin.pieces] : null;
  const isRushMode = game?.gameMode === "rush";

  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const cid = localStorage.getItem("clerkId");
    if (cid) {
      fetch("/api/auth/me?clerkId=" + cid)
        .then(r => r.ok && r.json())
        .then(d => setActiveSkin(d.activeSkin ?? {}))
        .catch(() => {});
    }
  }, []);

  const fetchGame = useCallback(async () => {
    if (!code) return;
    try {
      const res = await fetch(`/api/game/${code}`);
      if (res.ok) setGame(await res.json());
    } catch {}
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
      if (res.ok) setValidMoves((await res.json()).actions);
    } catch {}
  };

  const handleMove = async (row: number, col: number) => {
    if (!game || game.status !== "active" || playerColor !== game.turn || moving || !code) return;
    const piece = game.board[row][col];
    if (piece) {
      const isRed = piece === "r" || piece === "rk";
      const isMine = (playerColor === "red" && isRed) || (playerColor === "black" && !isRed);
      if (isMine) { setSelectedPos([row, col]); setValidMoves([]); fetchValidMoves(row, col); return; }
    }
    if (selectedPos) {
      const hasMove = validMoves.some(a => {
        const ls = a.steps[a.steps.length - 1];
        return ls.to[0] === row && ls.to[1] === col;
      });
      if (hasMove) {
        setMoving(true);
        try {
          const res = await fetch(`/api/game/${code}/move`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId, from: [selectedPos[0], selectedPos[1]], to: [row, col] }),
          });
          const data = await res.json();
          if (!res.ok) setError(data.error);
          else { setGame(data.game); setSelectedPos(null); setValidMoves([]); setError(""); }
        } catch { setError("Error"); }
        finally { setMoving(false); }
      }
    }
  };

  const handleResign = async () => {
    if (!code) return;
    setMoving(true);
    try {
      const res = await fetch(`/api/game/${code}/resign`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (res.ok) setGame((await res.json()).game);
    } finally { setMoving(false); }
  };

  if (!game) return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div className="spinner spinner-lg" />
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '1rem',
        color: 'var(--color-text-muted)', fontStyle: 'italic',
      }}>Cargando partida...</div>
    </div>
  );

  const winner = game.status === "red_wins" ? "Rojas" : game.status === "black_wins" ? "Negras" : null;
  const iWon = playerColor === (game.status === "red_wins" ? "red" : game.status === "black_wins" ? "black" : null);

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 24px',
      animation: 'fadeIn 0.6s var(--ease-out)',
    }}>
      <div className="animate-fade-in-down" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-gold-light)',
        }}>Damas</h1>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '0.75rem',
          color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginTop: 4,
        }}>Sala {code}</div>
      </div>

      <div style={{
        display: 'flex', gap: 32, alignItems: 'flex-start',
        justifyContent: 'center', width: '100%', maxWidth: 1100,
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(8, ${CELL_SIZE}px)`,
            borderRadius: 6, overflow: 'hidden',
            boxShadow: '0 0 0 2px var(--color-gold-dark), 0 0 0 4px rgba(201,168,76,0.15), var(--shadow-xl)',
          }}>
            {(playerColor === 'red' ? [...game.board].reverse() : game.board).map((row: any[], r: number) =>
              row.map((cell: string|null, c: number) => {
                const actualRow = playerColor === 'red' ? 7 - r : r;
                const isDark = (actualRow + c) % 2 !== 0;
                const isSelected = selectedPos?.[0] === actualRow && selectedPos?.[1] === c;
                const isPlayable = cell && ((playerColor === "red" && (cell === "r" || cell === "rk")) || (playerColor === "black" && (cell === "b" || cell === "bk")));
                const isValid = selectedPos && validMoves.some(a => { const ls = a.steps[a.steps.length - 1]; return ls.to[0] === actualRow && ls.to[1] === c; });
                const isCapture = selectedPos && validMoves.some(a => { const ls = a.steps[a.steps.length - 1]; return ls.to[0] === actualRow && ls.to[1] === c && ls.captured; });
                return (
                  <div key={`${actualRow}-${c}`} onClick={() => handleMove(actualRow, c)}
                    style={{
                      width: CELL_SIZE, height: CELL_SIZE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'default', position: 'relative',
                      background: isSelected
                        ? 'rgba(74,222,128,0.35)'
                        : isCapture
                          ? 'rgba(248,113,113,0.3)'
                          : isDark
                            ? (boardSkin?.dark ?? '#4a3c28')
                            : (boardSkin?.light ?? '#ede4d0'),
                      transition: 'background 200ms',
                    }}>
                    {cell && <div onClick={() => isPlayable && handleMove(actualRow, c)} style={{
                      width: 52, height: 52, borderRadius: '50%', position: 'relative', zIndex: 1,
                      cursor: isPlayable ? 'pointer' : 'default',
                      animation: 'pieceSettle 0.25s ease-out',
                      transform: isSelected ? 'scale(1.12)' : undefined,
                      background: (cell === "r" || cell === "rk")
                        ? (pieceSkin ? `radial-gradient(circle at 38% 32%, ${pieceSkin.red[0]} 0%, ${pieceSkin.red[1]} 45%, ${pieceSkin.red[2]} 100%)` : 'radial-gradient(circle at 38% 32%, #e85c50 0%, #c43a32 45%, #8a2825 100%)')
                        : (pieceSkin ? `radial-gradient(circle at 38% 32%, ${pieceSkin.black[0]} 0%, ${pieceSkin.black[1]} 45%, ${pieceSkin.black[2]} 100%)` : 'radial-gradient(circle at 38% 32%, #404060 0%, #1a1a2e 45%, #0d0d18 100%)'),
                      boxShadow: isSelected
                        ? '0 0 24px rgba(201,168,76,0.4), 0 0 48px rgba(201,168,76,0.15)'
                        : (cell === "r" || cell === "rk")
                          ? 'inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 3px 6px rgba(255,255,255,0.15), 0 2px 8px rgba(196,58,50,0.4)'
                          : 'inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 3px 6px rgba(255,255,255,0.08), 0 2px 8px rgba(26,26,46,0.5)',
                      transition: 'transform 200ms, box-shadow 200ms',
                    }}>
                      {(cell === "rk" || cell === "bk") && <span style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        fontSize: 22, color: '#ffd700',
                        textShadow: '0 0 8px rgba(255,215,0,0.6)',
                        pointerEvents: 'none',
                      }}>Q</span>}
                    </div>}
                    {isValid && !isCapture && <div style={{
                      position: 'absolute', width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(74,222,128,0.3)',
                      border: '2px solid rgba(74,222,128,0.5)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />}
                    {isCapture && <div style={{
                      position: 'absolute', inset: 4, borderRadius: '50%',
                      border: '2px solid rgba(248,113,113,0.6)',
                      animation: 'pulse 1s ease-in-out infinite',
                    }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          minWidth: 260, maxWidth: 280, flex: 1,
        }}>
          {isBotTurn && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.85rem', color: 'var(--color-gold-light)',
              animation: 'borderGlow 2s ease-in-out infinite',
            }}>
              <div className="spinner spinner-sm" />
              <span>Maquina pensando...</span>
            </div>
          )}

          <div className="card" style={{ padding: 20 }}>
            {isRushMode && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16,
                padding: 12,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}>Rojas</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: game?.redTimeRemaining != null && game.redTimeRemaining < 60 ? 'var(--color-red-light)' : 'var(--color-gold-light)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatTime(game?.redTimeRemaining)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)',
                    marginBottom: 4,
                  }}>Negras</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: game?.blackTimeRemaining != null && game.blackTimeRemaining < 60 ? 'var(--color-red-light)' : 'var(--color-gold-light)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatTime(game?.blackTimeRemaining)}
                  </div>
                </div>
              </div>
            )}

            {game.status !== "active" ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                  color: 'var(--color-gold-light)', marginBottom: 4,
                }}>
                  {winner === "Rojas" ? "Ganan las Rojas" : winner === "Negras" ? "Ganan las Negras" : "Empate"}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {iWon ? (isBotGame ? "Ganaste a la Maquina!" : "Has ganado!") : playerColor ? (isBotGame ? "La Maquina te gano" : "Has perdido") : ""}
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: 'var(--color-text-muted)', marginBottom: 12,
                }}>Turno actual</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: game.turn === 'red'
                      ? 'radial-gradient(circle at 40% 35%, #e85c50, #c43a32)'
                      : 'radial-gradient(circle at 40% 35%, #404060, #1a1a2e)',
                    boxShadow: game.turn === 'red'
                      ? '0 0 10px rgba(196,58,50,0.4)'
                      : '0 0 10px rgba(26,26,46,0.4)',
                  }} />
                  <div style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem',
                    color: game.turn === 'red' ? 'var(--color-red-light)' : '#7a7aaa',
                  }}>
                    {game.turn === 'red' ? 'Rojas' : 'Negras'}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: playerColor === game.turn ? 'var(--color-gold-light)' : 'var(--color-text-muted)',
                  marginBottom: 16,
                }}>
                  {playerColor === game.turn ? "Tu turno" : isBotGame ? "Maquina pensando..." : "Esperando oponente..."}
                </div>
                <div className="divider" />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', fontSize: '0.85rem',
                }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Movimientos</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-gold-light)' }}>{game.moveHistory.length}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', fontSize: '0.85rem',
                }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Eres</span>
                  <span style={{ fontWeight: 500 }}>{playerColor === 'red' ? 'Rojas' : playerColor === 'black' ? 'Negras' : '--'}</span>
                </div>
                {game.status === 'active' && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={handleResign} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
                      Rendirse
                    </button>
                    <button onClick={() => navigate({ to: "/" })} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
                      Salir al menu
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: 'var(--color-text-muted)', marginBottom: 12,
            }}>Historial</div>
            <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: '0.8rem' }}>
              {game.moveHistory.length === 0 ? (
                <div style={{
                  color: 'var(--color-text-dim)', fontStyle: 'italic',
                  fontSize: '0.8rem', padding: '8px 0',
                }}>Sin movimientos aun</div>
              ) : game.moveHistory.map((m: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i < game.moveHistory.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}>
                  <span style={{
                    color: 'var(--color-text-dim)',
                    fontVariantNumeric: 'tabular-nums', minWidth: '1.5rem',
                  }}>{i + 1}.</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    ({m.from[0]},{m.from[1]}) {"->"} ({m.to[0]},{m.to[1]})
                    {m.captured?.length && <span style={{ color: 'var(--color-red-light)', marginLeft: 4, fontSize: '0.7rem' }}>x</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {game.status !== "active" && (
        <div className="modal-overlay">
          <div className="modal" style={{
            padding: '48px 40px 32px',
            maxWidth: 420, textAlign: 'center',
            border: '1px solid var(--color-gold-dark)',
          }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)', marginBottom: 8,
            }}>
              {iWon ? "Victoria" : "Derrota"}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: '3rem', letterSpacing: '0.06em',
              color: winner === 'Rojas' ? 'var(--color-red-light)' : '#7a7aaa',
              textShadow: winner === 'Rojas'
                ? '0 0 30px var(--color-red-glow)'
                : '0 0 30px rgba(26,26,46,0.5)',
              marginBottom: 8,
            }}>
              {winner}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 24 }}>
              {iWon ? (isBotGame ? "Ganaste a la Maquina!" : "Has ganado!") : isBotGame ? "La Maquina te gano" : "Has perdido"}
            </p>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 32,
              margin: '20px 0', padding: '12px 0',
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
              }}>
                <span style={{
                  fontSize: '0.65rem', textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'var(--color-text-muted)',
                }}>Movimientos</span>
                <span style={{
                  fontWeight: 700, fontSize: '1.2rem',
                  color: 'var(--color-gold-light)',
                }}>{game.moveHistory.length}</span>
              </div>
            </div>
            <button onClick={() => navigate({ to: "/" })} className="btn btn-primary" style={{ width: '100%' }}>
              Volver al menu principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
