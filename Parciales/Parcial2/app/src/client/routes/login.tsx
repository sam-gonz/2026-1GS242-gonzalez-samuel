import { useState, useEffect, useRef } from 'react'
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const POKEMON_SPRITES = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
]

interface BgPokemon {
  x: number
  y: number
  size: number
  sprite: string
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  floatOffset: number
  floatSpeed: number
  blur: number
}

function AnimatedBgCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const pokemon: BgPokemon[] = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 20; i++) {
      pokemon.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 60 + Math.random() * 80,
        sprite: POKEMON_SPRITES[Math.floor(Math.random() * POKEMON_SPRITES.length)],
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        opacity: 0.08 + Math.random() * 0.12,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.001 + Math.random() * 0.002,
        blur: 1 + Math.random() * 3,
      })
    }

    const imgCache: Record<string, HTMLImageElement> = {}
    function loadImg(src: string): Promise<HTMLImageElement> {
      if (imgCache[src]) return Promise.resolve(imgCache[src])
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = src
        img.onload = () => { imgCache[src] = img; resolve(img) }
        img.onerror = () => {
          const fallback = new Image()
          fallback.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
          resolve(fallback)
        }
      })
    }
    Promise.all(POKEMON_SPRITES.map(loadImg)).catch(() => {})

    let time = 0
    function animate() {
      if (!ctx || !canvas) return
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of pokemon) {
        p.x += p.speedX
        p.y += p.speedY + Math.sin(time * p.floatSpeed + p.floatOffset) * 0.15
        p.rotation += p.rotationSpeed

        if (p.x < -p.size) p.x = canvas.width + p.size
        if (p.x > canvas.width + p.size) p.x = -p.size
        if (p.y < -p.size) p.y = canvas.height + p.size
        if (p.y > canvas.height + p.size) p.y = -p.size

        const img = imgCache[p.sprite]
        if (!img || !img.complete) return

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.filter = `blur(${p.blur}px)`
        ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { signUp, setActive } = useSignUp()
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  // FIX: si ya hay sesion activa, redirigir al home automaticamente
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/')
    }
  }, [isLoaded, isSignedIn])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp.create({
          emailAddress: email,
          password,
          unsafeMetadata: { name },
        })
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setVerifying(true)
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        })
        if (result.status === 'complete') {
          // FIX: usar setActiveSignIn para activar la sesion correctamente
          await setActiveSignIn({ session: result.createdSessionId })
          const userId = result.createdSessionId
            ? (result as any).createdUserId ?? result.identifier
            : email
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: (result as any).createdUserId,
              name: name || email.split('@')[0],
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
        const userId = result.createdUserId
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: userId,
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
      <AnimatedBgCanvas />

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
