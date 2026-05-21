import { useState } from 'react'
import { useSignIn, useSignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import AnimatedBg from '../components/AnimatedBg'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

  const { signIn } = useSignIn()
  const { signUp, setActive } = useSignUp()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp.create({
          emailAddress: email,
          password,
          publicMetadata: { name },
        })
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setVerifying(true)
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        })
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          const clerkId = result.createdSessionId
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: result.createdSessionId,
              name: email.split('@')[0],
              email,
            }),
          })
          navigate('/')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: result.createdSessionId,
            name,
            email,
          }),
        })
        navigate('/')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBg />

      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(12px, 2.5vw, 20px)',
            color: 'var(--accent)',
            marginBottom: '0.5rem',
            textShadow: '0 0 30px rgba(255,215,0,0.5)',
            letterSpacing: '0.1em',
          }}>
            POKEMON BATTLE ROOMS
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}>
            {isSignUp ? 'CREA TU CUENTA' : 'INGRESA A TU CUENTA'}
          </p>
        </div>

        <div style={{
          background: 'rgba(16,16,26,0.95)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 0 40px rgba(255,215,0,0.1), 0 8px 32px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          {verifying ? (
            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '8px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.1em',
                }}>
                  CODIGO DE VERIFICACION
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  style={{
                    width: '100%',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '18px',
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                  }}
                />
              </div>
              {error && (
                <p style={{ color: 'var(--red)', fontSize: '11px', marginBottom: '1rem' }}>
                  ERROR: {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-display)',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  padding: '1rem',
                  background: 'var(--accent)',
                  color: '#0a0a0f',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? 'VERIFICANDO...' : 'VERIFICAR'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '8px',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.1em',
                  }}>
                    NOMBRE
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ash Ketchum"
                    required={isSignUp}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '8px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.1em',
                }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trainer@pokemon.com"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '8px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.1em',
                }}>
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <p style={{ color: 'var(--red)', fontSize: '11px', marginBottom: '1rem' }}>
                  ERROR: {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-display)',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  padding: '1rem',
                  background: 'var(--accent)',
                  color: '#0a0a0f',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  marginBottom: '1rem',
                }}
              >
                {loading ? 'CARGANDO...' : isSignUp ? 'CREAR CUENTA' : 'INGRESAR'}
              </button>
            </form>
          )}

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            textAlign: 'center',
          }}>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setVerifying(false)
                setCode('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <span style={{ color: 'var(--accent)' }}>
                {isSignUp ? 'Ingresa aqui' : 'Registrate aqui'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}