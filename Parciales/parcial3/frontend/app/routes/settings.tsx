import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import "../../styles/globals.css";

type ThemeMode = "dark" | "midnight";

interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  animationsEnabled: boolean;
  showMoveHints: boolean;
  autoPromote: boolean;
  confirmResign: boolean;
  boardCoordinates: boolean;
  theme: ThemeMode;
}

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: false,
  volume: 70,
  animationsEnabled: true,
  showMoveHints: true,
  autoPromote: true,
  confirmResign: true,
  boardCoordinates: false,
  theme: "dark",
};

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gameSettings");
    if (stored) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }); } catch {}
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("gameSettings", JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      padding: '40px 24px',
      maxWidth: 700, margin: '0 auto',
    }}>
      <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem',
              letterSpacing: '0.08em', color: 'var(--color-gold-light)',
            }}>CONFIGURACION</h1>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
              color: 'var(--color-text-muted)', fontStyle: 'italic',
            }}>Personaliza tu experiencia de juego</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="animate-fade-in-down" style={{
          padding: '12px 18px', marginBottom: 24,
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: '0.85rem', color: 'var(--color-success)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          Configuracion guardada
        </div>
      )}

      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SettingsSection title="Audio" icon="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07">
          <ToggleSetting
            label="Efectos de sonido"
            desc="Sonidos al mover fichas y capturar"
            value={settings.soundEnabled}
            onChange={v => updateSetting("soundEnabled", v)}
          />
          <ToggleSetting
            label="Musica de fondo"
            desc="Musica ambiental durante el juego"
            value={settings.musicEnabled}
            onChange={v => updateSetting("musicEnabled", v)}
          />
          {settings.soundEnabled && (
            <div style={{ padding: '0 20px' }}>
              <label style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 500,
                color: 'var(--color-text-muted)', marginBottom: 8,
              }}>Volumen: {settings.volume}%</label>
              <input type="range" min="0" max="100" value={settings.volume}
                onChange={e => updateSetting("volume", Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
            </div>
          )}
        </SettingsSection>

        <SettingsSection title="Juego" icon="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5">
          <ToggleSetting
            label="Animaciones"
            desc="Animaciones suaves al mover piezas"
            value={settings.animationsEnabled}
            onChange={v => updateSetting("animationsEnabled", v)}
          />
          <ToggleSetting
            label="Mostrar pistas"
            desc="Resaltar movimientos validos al seleccionar una ficha"
            value={settings.showMoveHints}
            onChange={v => updateSetting("showMoveHints", v)}
          />
          <ToggleSetting
            label="Auto-promocion"
            desc="Promocionar automaticamente al llegar al final"
            value={settings.autoPromote}
            onChange={v => updateSetting("autoPromote", v)}
          />
          <ToggleSetting
            label="Confirmar rendicion"
            desc="Pedir confirmacion antes de rendirse"
            value={settings.confirmResign}
            onChange={v => updateSetting("confirmResign", v)}
          />
        </SettingsSection>

        <SettingsSection title="Tablero" icon="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18">
          <ToggleSetting
            label="Coordenadas"
            desc="Mostrar letras y numeros en el tablero"
            value={settings.boardCoordinates}
            onChange={v => updateSetting("boardCoordinates", v)}
          />
        </SettingsSection>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button onClick={() => navigate({ to: "/" })} className="btn btn-secondary">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-glass)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
          <path d={icon}/>
        </svg>
        <h2 style={{
          fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--color-text)',
        }}>{title}</h2>
      </div>
      <div style={{ padding: '8px 0' }}>
        {children}
      </div>
    </div>
  );
}

function ToggleSetting({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      transition: 'background var(--transition-fast)',
    }}
    onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
    onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.9rem', fontWeight: 500,
          color: 'var(--color-text)', marginBottom: 2,
        }}>{label}</div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}>{desc}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 48, height: 26, borderRadius: 13,
        background: value ? 'var(--color-gold)' : 'var(--color-bg-alt)',
        border: '1px solid ' + (value ? 'var(--color-gold)' : 'var(--color-border)'),
        position: 'relative',
        transition: 'all var(--transition)',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2,
          left: value ? 23 : 2,
          width: 20, height: 20, borderRadius: '50%',
          background: value ? 'var(--color-bg)' : 'var(--color-text-muted)',
          transition: 'left var(--transition)',
          boxShadow: 'var(--shadow-sm)',
        }} />
      </button>
    </div>
  );
}
