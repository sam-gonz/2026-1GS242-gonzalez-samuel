import { useEffect, useRef, useState } from 'react'

// ─── Fuentes de imágenes (mismas APIs del seed, sin backend) ──────────────────
// Scryfall: cartas MTG con imagen small (JPG ~40KB c/u)
// YGOPRODeck: cartas YGO con image_url_small

const SCRYFALL_QUERIES = [
  'q=set:war&order=edhrec&unique=art',   // War of the Spark
  'q=set:isd&order=edhrec&unique=art',   // Innistrad
  'q=set:ktk&order=edhrec&unique=art',   // Khans of Tarkir
  'q=set:zen&order=edhrec&unique=art',   // Zendikar
]

const YGO_ARCHETYPES = [
  'Blue-Eyes',
  'Dark Magician',
  'Elemental HERO',
  'Salamangreat',
]

const TOTAL_CARDS = 20   // cuántas cartas mostrar en pantalla
const SWAP_INTERVAL_MIN = 4000  // ms mínimo entre swaps por carta
const SWAP_INTERVAL_MAX = 8000  // ms máximo

interface CardSlot {
  id: number
  url: string
  top: number    // % vertical
  left: number   // % horizontal
  rotate: number // deg
  scale: number
  opacity: number
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

async function fetchMTGImages(): Promise<string[]> {
  const query = SCRYFALL_QUERIES[Math.floor(Math.random() * SCRYFALL_QUERIES.length)]
  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/search?${query}&page=1`,
      { headers: { 'User-Agent': 'TradeUpTCG-Web/1.0' } }
    )
    if (!res.ok) return []
    const json = await res.json() as { data: any[] }
    return (json.data ?? [])
      .filter((c: any) => c.image_uris?.small || c.card_faces?.[0]?.image_uris?.small)
      .map((c: any) => c.image_uris?.small ?? c.card_faces[0].image_uris.small)
      .slice(0, 30)
  } catch {
    return []
  }
}

async function fetchYGOImages(): Promise<string[]> {
  const archetype = YGO_ARCHETYPES[Math.floor(Math.random() * YGO_ARCHETYPES.length)]
  try {
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${encodeURIComponent(archetype)}&num=30&offset=0`
    )
    if (!res.ok) return []
    const json = await res.json() as { data: any[] }
    return (json.data ?? [])
      .filter((c: any) => c.card_images?.[0]?.image_url_small)
      .map((c: any) => c.card_images[0].image_url_small as string)
      .slice(0, 30)
  } catch {
    return []
  }
}

function buildSlots(images: string[]): CardSlot[] {
  // Distribución en grid 4x5 con ruido para que no quede rígido
  const cols = 5
  const rows = 4
  const slots: CardSlot[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (slots.length >= TOTAL_CARDS) break
      const img = images[slots.length % images.length]
      slots.push({
        id: slots.length,
        url: img,
        // distribucion con ruido: cada celda ocupa 100/cols % del espacio
        top:    (r / rows) * 90 + rand(-4, 4),
        left:   (c / cols) * 92 + rand(-3, 3),
        rotate: rand(-18, 18),
        scale:  rand(0.7, 1.05),
        opacity: rand(0.045, 0.11),   // muy sutil — el blur hace el resto
      })
    }
  }
  return slots
}

export function CardBackground() {
  const [slots, setSlots] = useState<CardSlot[]>([])
  const [pool, setPool] = useState<string[]>([])
  const poolRef = useRef<string[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // 1. Cargar imágenes al montar
  useEffect(() => {
    let cancelled = false

    async function load() {
      const [mtg, ygo] = await Promise.all([fetchMTGImages(), fetchYGOImages()])
      if (cancelled) return

      // mezcla y desordena
      const all = [...mtg, ...ygo].sort(() => Math.random() - 0.5)
      if (all.length === 0) return

      poolRef.current = all
      setPool(all)
      setSlots(buildSlots(all))
    }

    load()
    return () => { cancelled = true }
  }, [])

  // 2. Intercalar imágenes por slot independientemente
  useEffect(() => {
    if (slots.length === 0 || pool.length === 0) return

    // limpiar timers previos
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    function scheduleSwap(slotId: number) {
      const delay = rand(SWAP_INTERVAL_MIN, SWAP_INTERVAL_MAX)
      const t = setTimeout(() => {
        setSlots((prev) => {
          const newPool = poolRef.current
          if (newPool.length === 0) return prev
          const next = newPool[Math.floor(Math.random() * newPool.length)]
          return prev.map((s) =>
            s.id === slotId
              ? { ...s, url: next, rotate: rand(-18, 18), scale: rand(0.7, 1.05) }
              : s
          )
        })
        scheduleSwap(slotId) // re-agenda
      }, delay)
      timersRef.current.push(t)
    }

    slots.forEach((s) => scheduleSwap(s.id))

    return () => timersRef.current.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.length, pool.length])

  if (slots.length === 0) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* capa de blur global sobre todas las cartas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 1,
        }}
      />

      {slots.map((slot) => (
        <img
          key={slot.id}
          src={slot.url}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute',
            top: `${slot.top}%`,
            left: `${slot.left}%`,
            width: '120px',
            borderRadius: '8px',
            transform: `rotate(${slot.rotate}deg) scale(${slot.scale})`,
            opacity: slot.opacity,
            // crossfade suave al cambiar url
            transition: 'opacity 1.5s ease, transform 1.5s ease',
            zIndex: 0,
            userSelect: 'none',
            objectFit: 'cover',
          }}
          onError={(e) => {
            // si falla la imagen, ocultarla silenciosamente
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ))}
    </div>
  )
}
