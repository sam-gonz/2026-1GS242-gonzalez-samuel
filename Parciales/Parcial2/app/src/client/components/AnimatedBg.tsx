import { useEffect, useRef } from 'react'

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
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',
]

interface PokemonFloat {
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
}

export default function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const pokemon: PokemonFloat[] = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 15; i++) {
      pokemon.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 40 + Math.random() * 60,
        sprite: POKEMON_SPRITES[Math.floor(Math.random() * POKEMON_SPRITES.length)],
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        opacity: 0.06 + Math.random() * 0.1,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.002 + Math.random() * 0.003,
      })
    }

    const imgCache: Record<string, HTMLImageElement> = {}
    function loadImg(src: string): Promise<HTMLImageElement> {
      if (imgCache[src]) return Promise.resolve(imgCache[src])
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = src
        img.onload = () => {
          imgCache[src] = img
          resolve(img)
        }
        img.onerror = () => {
          const fallback = new Image()
          fallback.crossOrigin = 'anonymous'
          fallback.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
          resolve(fallback)
        }
      })
    }
    const preloads = POKEMON_SPRITES.map(loadImg)
    Promise.all(preloads).catch(() => {})

    let time = 0
    function animate() {
      if (!ctx || !canvas) return
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of pokemon) {
        p.x += p.speedX
        p.y += p.speedY + Math.sin(time * p.floatSpeed + p.floatOffset) * 0.2
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