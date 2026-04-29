import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '🔄', title: 'Intercambios C2C', desc: 'Ofrece tus cartas, propone intercambios directos o mixtos con otros coleccionistas.' },
  { icon: '🏪', title: 'Tienda Oficial', desc: 'Cartas selladas y singles gradeados directamente de TradeUp con garantía de autenticidad.' },
  { icon: '🔒', title: 'Pagos Seguros', desc: 'Stripe Connect mantiene el dinero en hold hasta que ambas partes confirmen la transacción.' },
  { icon: '⭐', title: 'Sistema de Reputación', desc: 'Reviews verificadas por transacción real. Sabes exactamente con quién estás tratando.' },
  { icon: '🃏', title: 'Catálogo TCG', desc: 'Pokémon, Yu-Gi-Oh!, One Piece, Dragon Ball, MTG y más. Búsqueda instantánea.' },
  { icon: '📱', title: 'Diseñado para Coleccionistas', desc: 'Interface oscura, rápida y sin distracciones. Tu colección, tu ritmo.' },
]

const GAMES = [
  { name: 'Pokémon', emoji: '⚡' },
  { name: 'Yu-Gi-Oh!', emoji: '👁️' },
  { name: 'One Piece', emoji: '🏴‍☠️' },
  { name: 'Dragon Ball', emoji: '🔮' },
  { name: 'MTG', emoji: '🪄' },
]

// Cartas decorativas para el fondo animado
const BG_CARDS = [
  {
    label: 'Charizard',
    emoji: '🔥',
    color: 'from-orange-500/30 to-red-600/20',
    border: 'border-orange-400/30',
    game: 'Pokémon',
    rarity: '★★★',
  },
  {
    label: 'Dark Magician',
    emoji: '🪄',
    color: 'from-purple-600/30 to-indigo-700/20',
    border: 'border-purple-400/30',
    game: 'Yu-Gi-Oh!',
    rarity: '★★★',
  },
  {
    label: 'Monkey D. Luffy',
    emoji: '🏴‍☠️',
    color: 'from-red-500/30 to-yellow-600/20',
    border: 'border-red-400/30',
    game: 'One Piece',
    rarity: '★★★',
  },
  {
    label: 'Goku SSJ',
    emoji: '⚡',
    color: 'from-yellow-400/30 to-orange-500/20',
    border: 'border-yellow-300/30',
    game: 'Dragon Ball',
    rarity: '★★★',
  },
  {
    label: 'Black Lotus',
    emoji: '🌸',
    color: 'from-slate-400/30 to-gray-600/20',
    border: 'border-slate-300/30',
    game: 'MTG',
    rarity: '★★★',
  },
  {
    label: 'Pikachu VMAX',
    emoji: '⚡',
    color: 'from-yellow-300/30 to-amber-500/20',
    border: 'border-yellow-300/30',
    game: 'Pokémon',
    rarity: '★★★',
  },
  {
    label: 'Blue-Eyes Dragon',
    emoji: '🐉',
    color: 'from-blue-400/30 to-cyan-600/20',
    border: 'border-blue-300/30',
    game: 'Yu-Gi-Oh!',
    rarity: '★★★',
  },
  {
    label: 'Vegeta SSB',
    emoji: '💙',
    color: 'from-blue-600/30 to-violet-700/20',
    border: 'border-blue-400/30',
    game: 'Dragon Ball',
    rarity: '★★★',
  },
]

// Componente de banda de cartas animadas
function CardStrip({ cards, duration, offsetY }: { cards: typeof BG_CARDS; duration: number; offsetY: string }) {
  // Duplicamos para loop infinito sin salto
  const doubled = [...cards, ...cards]
  return (
    <div
      className="absolute flex gap-4 pointer-events-none"
      style={{ top: offsetY }}
    >
      <motion.div
        className="flex gap-4"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {doubled.map((card, i) => (
          <div
            key={i}
            className={`relative flex-shrink-0 w-28 h-40 rounded-xl border bg-gradient-to-br ${card.color} ${card.border} backdrop-blur-sm flex flex-col items-center justify-center gap-1 overflow-hidden`}
          >
            <span className="text-3xl">{card.emoji}</span>
            <span className="text-[10px] font-bold text-white/80 text-center px-1 leading-tight">{card.label}</span>
            <span className="text-[9px] text-white/50">{card.game}</span>
            <span className="text-[9px] text-yellow-300/70">{card.rarity}</span>
            {/* Brillo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-xl" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">

        {/* ── Fondo: blur glow central ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand)]/10 rounded-full blur-[120px]" />
        </div>

        {/* ── Bandas de cartas animadas (fondo) ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Degradado superior para que las cartas se desvanezcan arriba */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--color-bg)] to-transparent z-10" />
          {/* Degradado inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent z-10" />
          {/* Degradado izquierda */}
          <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10" />
          {/* Degradado derecha */}
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10" />

          {/* Capa de blur global sobre las cartas */}
          <div className="absolute inset-0 backdrop-blur-[2px] z-[5]" />

          {/* Banda 1 — más arriba, velocidad normal */}
          <CardStrip
            cards={BG_CARDS}
            duration={28}
            offsetY="8%"
          />
          {/* Banda 2 — medio, velocidad más lenta */}
          <CardStrip
            cards={[...BG_CARDS].reverse()}
            duration={38}
            offsetY="38%"
          />
          {/* Banda 3 — abajo, velocidad media */}
          <CardStrip
            cards={BG_CARDS.slice(2)}
            duration={22}
            offsetY="65%"
          />

          {/* Opacidad general de las cartas baja para no tapar el texto */}
          <div className="absolute inset-0 bg-[var(--color-bg)]/55 z-[6]" />
        </div>

        {/* ── Contenido del hero (encima de todo) ── */}
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-brand)]/40 text-[var(--color-brand-light)] bg-[var(--color-brand)]/10 mb-6">
              🚀 Ahora en Beta — Únete gratis
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              El marketplace de
              <span className="block bg-gradient-to-r from-[var(--color-brand-light)] to-purple-300 bg-clip-text text-transparent">
                cartas TCG
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Compra, vende e intercambia cartas coleccionables con coleccionistas de toda Latinoamérica.
              Pagos seguros, reputación verificada, catálogo completo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-brand)]/25"
              >
                Explorar Marketplace →
              </Link>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-3)]/80 text-white font-semibold border border-[var(--color-border)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver Tienda Oficial
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {GAMES.map((g) => (
              <span key={g.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-white hover:border-[var(--color-brand)]/50 transition-colors cursor-default">
                <span>{g.emoji}</span>{g.name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitas para coleccionar</h2>
          <p className="text-[var(--color-muted)] max-w-xl mx-auto">Diseñado por coleccionistas, para coleccionistas.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] border border-[var(--color-border)] card-glow"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="p-10 rounded-2xl bg-gradient-to-br from-[var(--color-brand)]/20 to-[var(--color-surface-2)] border border-[var(--color-brand)]/30">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para empezar?</h2>
          <p className="text-[var(--color-muted)] mb-8">Regístrate gratis y empieza a intercambiar en minutos.</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-[var(--color-brand)]/25"
          >
            Explorar ahora →
          </Link>
        </div>
      </section>
    </div>
  )
}
