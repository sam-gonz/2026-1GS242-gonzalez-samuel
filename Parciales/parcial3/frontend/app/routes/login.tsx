import { useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { SignIn, useUser } from "@clerk/clerk-react";
import "../../styles/globals.css";

export default function Login() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      localStorage.setItem("clerkId", user.id);
      const name = user.firstName || user.fullName || user.primaryEmailAddress?.emailAddress || "";
      localStorage.setItem("clerkName", name);
      window.dispatchEvent(new CustomEvent("auth-changed"));
      navigate({ to: "/" });
    }
  }, [isLoaded, user, navigate]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', gap: 24,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }} />
      </div>

      <div className="animate-fade-in-up" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 40px rgba(201,168,76,0.3)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-red-light) 0%, var(--color-red-dark) 100%)',
              boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 3px 6px rgba(255,255,255,0.2)',
            }} />
          </div>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem',
          letterSpacing: '0.1em', color: 'var(--color-gold-light)',
          marginBottom: 8,
        }}>BIENVENIDO</h1>
        <p style={{
          fontFamily: 'var(--font-heading)', fontSize: '1rem',
          color: 'var(--color-text-muted)', fontStyle: 'italic',
        }}>Inicia sesion para guardar tu progreso</p>
      </div>

      <div className="animate-fade-in-up stagger-2" style={{
        position: 'relative', zIndex: 1,
        background: 'var(--color-glass)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: 32,
        maxWidth: 400, width: '100%',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              marginBottom: 20, color: 'var(--color-text-muted)', fontSize: '0.9rem',
            }}>Modo demo - sin autenticacion</p>
            <button onClick={() => navigate({ to: "/" })} className="btn btn-primary" style={{ width: '100%' }}>
              Ir al inicio
            </button>
          </div>
        ) : (
          <SignIn routing="hash" afterSignInUrl="/" />
        )}
      </div>

      <Link to="/" className="animate-fade-in-up stagger-3" style={{
        position: 'relative', zIndex: 1,
        fontSize: '0.85rem', color: 'var(--color-text-muted)',
        display: 'flex', alignItems: 'center', gap: 8,
        transition: 'color var(--transition)',
      }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12,19 5,12 12,5"/>
        </svg>
        Volver al inicio
      </Link>
    </div>
  );
}
