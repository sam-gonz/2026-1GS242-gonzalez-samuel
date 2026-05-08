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

const POPULAR_CARDS = [
  {
    name: 'Charizard ex',
    set: 'Scarlet & Violet — 151',
    game: 'Pokémon',
    rarity: 'Double Rare',
    price: 89.99,
    image: 'https://images.pokemontcg.io/sv3pt5/6_hires.png',
    badge: 'Más buscada',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    name: 'Blue-Eyes White Dragon',
    set: 'Legend of Blue Eyes',
    game: 'Yu-Gi-Oh!',
    rarity: 'Ultra Rare',
    price: 120.00,
    image: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    badge: 'Clásico',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    name: 'Monkey D. Luffy',
    set: 'Romance Dawn — OP-01',
    game: 'One Piece',
    rarity: 'Secret Rare',
    price: 210.00,
    image: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-060_p1.png',
    badge: 'Trending',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    name: 'Black Lotus',
    set: 'Alpha Edition',
    game: 'MTG',
    rarity: 'Rare',
    price: 4500.00,
    image: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    badge: 'Legendaria',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    name: 'Pikachu Illustrator',
    set: 'CoroCoro Promo',
    game: 'Pokémon',
    rarity: 'Promo',
    price: 3200.00,
    image: 'https://images.pokemontcg.io/swshp/SWSH076_hires.png',
    badge: 'Ultra rara',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    name: 'Goku SSJ — SPR',
    set: 'Saiyan Showdown — BT23',
    game: 'Dragon Ball',
    rarity: 'Special Rare',
    price: 55.00,
    image: 'https://www.dbs-cardgame.com/images/cardlist/bt23/BT23-001_SPR.png',
    badge: 'Popular',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
]

function CardItem({ card, index }: { card: typeof POPULAR_CARDS[0]; index: number }) {
  return (
    <motion.div
      className="group relative flex flex-col rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-brand)]/50 transition-all hover:-translate-y-1 cursor-default"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
    >
      {/* Imagen */}
      <div className="relative h-52 bg-[var(--color-surface-3)] overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
          {card.badge}
        </span>
        {/* Rank */}
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
          #{index + 1}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-white text-sm font-semibold leading-tight truncate">{card.name}</p>
        <p className="text-[var(--color-muted)] text-[11px] truncate">{card.set}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted)] uppercase tracking-wide">
            {card.game}
          </span>
          <span className="text-sm font-bold text-[var(--color-brand-light)]">
            ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand)]/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-brand)]/40 text-[var(--color-brand-light)] bg-[var(--color-brand)]/10 mb-6">
              Ahora en Beta — Únete gratis
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

      {/* Popular Cards */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-brand)]/40 text-[var(--color-brand-light)] bg-[var(--color-brand)]/10 mb-4">
            Tendencias
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Cartas más populares
          </h2>
          <p className="text-[var(--color-muted)] max-w-md mx-auto text-sm">
            Las cartas más buscadas por coleccionistas en este momento.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CARDS.map((card, i) => (
            <CardItem key={card.name} card={card} index={i} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] text-sm hover:text-white hover:border-[var(--color-brand)]/50 transition-all"
          >
            Ver todas las cartas →
          </Link>
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
