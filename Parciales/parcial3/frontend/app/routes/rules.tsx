import { Link } from "@tanstack/react-router";
import { useState } from "react";
import "../../styles/globals.css";

interface RuleSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

const SECTIONS: RuleSection[] = [
  {
    id: "basico",
    title: "Reglas Basicas",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p>Las damas es un juego de estrategia para dos jugadores que se juega en un tablero de 8x8 casillas alternadas.</p>
        <RuleItem title="Objetivo" text="Capturar todas las fichas del oponente o bloquear sus movimientos para que no pueda jugar." />
        <RuleItem title="Posicion inicial" text="Cada jugador comienza con 12 fichas colocadas en las tres filas mas cercanas a su lado, ocupando solo las casillas oscuras." />
        <RuleItem title="Turnos" text="Las fichas rojas siempre mueven primero. Los jugadores se alternan turnos." />
      </div>
    ),
  },
  {
    id: "movimiento",
    title: "Movimiento de Fichas",
    icon: "M5 12h14M12 5l7 7-7 7",
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <RuleItem title="Movimiento basico" text="Las fichas normales solo pueden moverse en diagonal hacia adelante, una casilla a la vez." />
        <RuleItem title="Casillas oscuras" text="Todas las fichas se mueven exclusivamente por las casillas de color oscuro del tablero." />
        <RuleItem title="Sin retroceso" text="Las fichas normales NO pueden moverse hacia atras, solo hacia adelante." />
        <InfoBox color="info" title="Recuerda" text="Solo puedes mover una ficha por turno. No puedes pasar tu turno sin mover." />
      </div>
    ),
  },
  {
    id: "captura",
    title: "Capturas",
    icon: "M18 6L6 18M6 6l12 12",
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <RuleItem title="Salto sobre enemigo" text="Si una ficha enemiga esta adyacente en diagonal y la casilla detras de ella esta vacia, puedes capturarla saltando sobre ella." />
        <RuleItem title="Captura obligatoria" text="Si hay una captura disponible, estas obligado a realizarla. No puedes elegir otro movimiento." />
        <RuleItem title="Capturas multiples" text="Si despues de una captura puedes realizar otra, debes continuar capturando en el mismo turno. Esto se llama cadena de capturas." />
        <RuleItem title="Direccion" text="Las capturas pueden hacerse en cualquier direccion diagonal, incluso hacia atras para fichas normales." />
      </div>
    ),
  },
  {
    id: "dama",
    title: "Promocion a Dama",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <RuleItem title="Como promover" text="Cuando una ficha normal llega a la ultima fila del lado contrario, se promociona a Dama." />
        <RuleItem title="Movimiento de Dama" text="La Dama puede moverse en cualquier direccion diagonal: adelante, atras, y tantas casillas como desee en linea recta." />
        <RuleItem title="Captura de Dama" text="La Dama puede capturar en cualquier direccion diagonal y puede saltar multiples casillas para capturar." />
        <InfoBox color="gold" title="La Dama" text="La Dama es la pieza mas poderosa del juego. Su versatilidad de movimiento la hace extremadamente valiosa." />
      </div>
    ),
  },
  {
    id: "fin",
    title: "Fin del Juego",
    icon: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <RuleItem title="Victoria" text="Ganas cuando capturas todas las fichas del oponente o cuando tu oponente no tiene movimientos legales disponibles." />
        <RuleItem title="Derrota" text="Pierdes cuando todas tus fichas son capturadas o cuando no puedes realizar ningun movimiento legal." />
        <RuleItem title="Rendicion" text="Puedes rendirte en cualquier momento usando el boton de rendicion. Tu oponente ganara la partida." />
        <RuleItem title="Empate" text="Se declara empate cuando ambos jugadores acuerdan o cuando se repite la misma posicion tres veces." />
      </div>
    ),
  },
  {
    id: "estrategia",
    title: "Consejos Estrategicos",
    icon: "M9.663 17h4.673M12 2v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TipItem number={1} title="Controla el centro" text="Las fichas en el centro del tablero tienen mas opciones de movimiento y son mas dificiles de capturar." />
        <TipItem number={2} title="Protege tu ultima fila" text="Mantener fichas en tu ultima fila evita que el oponente promocione a Dama." />
        <TipItem number={3} title="Busca cadenas" text="Planifica movimientos que te permitan realizar capturas multiples en un solo turno." />
        <TipItem number={4} title="Promociona temprano" text="Una Dama es extremadamente valiosa. Prioriza llevar fichas al otro lado del tablero." />
        <TipItem number={5} title="No sacrifiques piezas" text="Evita perder fichas innecesariamente. Cada pieza cuenta en el final del juego." />
      </div>
    ),
  },
];

export default function Rules() {
  const [activeSection, setActiveSection] = useState("basico");
  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      padding: '40px 24px',
      maxWidth: 1000, margin: '0 auto',
    }}>
      <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem',
              letterSpacing: '0.08em', color: 'var(--color-gold-light)',
            }}>REGLAS DEL JUEGO</h1>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
              color: 'var(--color-text-muted)', fontStyle: 'italic',
            }}>Aprende a jugar damas paso a paso</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-1" style={{
        display: 'flex', gap: 24,
      }}>
        <div style={{
          width: 240, flexShrink: 0,
          position: 'sticky', top: 96, alignSelf: 'flex-start',
        }}>
          <nav style={{
            background: 'var(--color-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 8,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {SECTIONS.map(section => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                background: activeSection === section.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                border: 'none',
                borderLeft: '3px solid ' + (activeSection === section.id ? 'var(--color-gold)' : 'transparent'),
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
                color: activeSection === section.id ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
                textAlign: 'left',
                transition: 'all var(--transition)',
                width: '100%',
              }}
              onMouseOver={e => {
                if (activeSection !== section.id) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                }
              }}
              onMouseOut={e => {
                if (activeSection !== section.id) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={section.icon}/>
                </svg>
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card animate-fade-in" key={activeSection} style={{
            padding: 32,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'rgba(201,168,76,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                  <path d={currentSection.icon}/>
                </svg>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600,
                color: 'var(--color-gold-light)',
              }}>{currentSection.title}</h2>
            </div>

            <div style={{
              fontSize: '0.95rem', lineHeight: 1.8,
              color: 'var(--color-text-secondary)',
            }}>
              {currentSection.content}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link to="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function RuleItem({ title, text }: { title: string; text: string }) {
  return (
    <div style={{
      padding: '14px 18px',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{
        fontSize: '0.85rem', fontWeight: 600,
        color: 'var(--color-text)', marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--color-gold)',
        }} />
        {title}
      </div>
      <div style={{
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
        paddingLeft: 14,
      }}>{text}</div>
    </div>
  );
}

function InfoBox({ color, title, text }: { color: "info" | "gold"; title: string; text: string }) {
  const colors = {
    info: { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', text: 'var(--color-info)' },
    gold: { bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)', text: 'var(--color-gold-light)' },
  };
  const c = colors[color];
  return (
    <div style={{
      padding: 16, background: c.bg,
      border: '1px solid ' + c.border,
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{
        fontSize: '0.8rem', fontWeight: 600,
        color: c.text, marginBottom: 6,
      }}>{title}</div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{text}</p>
    </div>
  );
}

function TipItem({ number, title, text }: { number: number; title: string; text: string }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '14px 18px',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem',
        color: 'var(--color-bg)',
        flexShrink: 0,
      }}>{number}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.9rem', fontWeight: 600,
          color: 'var(--color-text)', marginBottom: 4,
        }}>{title}</div>
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
        }}>{text}</div>
      </div>
    </div>
  );
}
