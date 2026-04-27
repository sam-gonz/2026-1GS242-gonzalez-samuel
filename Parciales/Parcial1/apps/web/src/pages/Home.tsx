import { Link } from 'react-router-dom';
import { useAuth, UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS } from '../lib/constants';

interface FeaturedCard {
  _id: string;
  title: string;
  game: string;
  price: number;
  images: string[];
}

function GameBadge({ game }: { game: string }) {
  return (
    <span
      className="px-2 py-0.5 text-xs font-semibold rounded"
      style={{ 
        backgroundColor: GAME_COLORS[game] + '20',
        color: GAME_COLORS[game],
        border: `1px solid ${GAME_COLORS[game]}40`
      }}
    >
      {GAME_LABELS[game]}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl font-bold text-text">{value}</div>
      <div className="font-body text-xs text-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function Home() {
  const { isLoaded, userId } = useAuth();
  
  const { data: cardsData } = useQuery({
    queryKey: ['cards', 'featured'],
    queryFn: () => api.get<{ data: FeaturedCard[] }>('/cards?limit=6&sort=newest'),
  });
  
  const featuredCards = cardsData?.data || [];
  
  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-pokemon rounded flex items-center justify-center">
              <span className="font-display font-bold text-surface text-sm">T</span>
            </div>
            <span className="font-display text-xl font-bold text-text group-hover:text-pokemon transition-colors">
              Trade<span className="text-pokemon">Up</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className="font-body text-sm text-text-muted hover:text-text transition-colors">
              Marketplace
            </Link>
            <Link to="/trades" className="font-body text-sm text-text-muted hover:text-text transition-colors">
              Trade Board
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <SignedIn>
              <Link 
                to="/dashboard" 
                className="font-body text-sm text-text-muted hover:text-text transition-colors hidden md:block"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="font-body text-sm bg-pokemon text-surface px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-surface">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,215,0,0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(239,68,68,0.08) 0%, transparent 40%)
            `
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pokemon/10 border border-pokemon/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-pokemon rounded-full animate-pulse" />
              <span className="font-body text-xs text-pokemon font-medium">For Collectors, By Collectors</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-text mb-6 leading-tight">
              Trade Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pokemon via-yellow-400 to-pokemon animate-gradient">
                Way
              </span>
            </h1>
            
            <p className="font-body text-lg text-text-muted max-w-xl mb-10 leading-relaxed">
              The definitive marketplace for trading card collectors. Buy, sell, and trade 
              Pokémon, Yu-Gi-Oh!, One Piece, and more with collectors worldwide.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/marketplace" 
                className="font-body bg-pokemon text-surface px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-pokemon/20"
              >
                Explore Cards
              </Link>
              <Link 
                to="/trades" 
                className="font-body border border-border text-text px-8 py-3.5 rounded-xl font-semibold hover:bg-surface-hover transition-all"
              >
                Start Trading
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative cards */}
        <div className="hidden xl:block absolute right-10 top-1/2 -translate-y-1/2 w-80 h-120 perspective">
          <div className="relative w-full h-full animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-pokemon/30 to-transparent rounded-2xl rotate-6 transform translate-x-4" />
            <div className="absolute inset-0 bg-surface-elevated rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="aspect-[3/4] bg-gradient-to-br from-pokemon/20 to-surface" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="font-display text-sm font-bold text-text">Charizard</div>
                <div className="font-body text-xs text-text-muted">Base Set 2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-surface-elevated/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat label="Cards Listed" value="12K+" />
            <Stat label="Active Traders" value="3K+" />
            <Stat label="Trades Completed" value="25K+" />
            <Stat label="Games Supported" value="6" />
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-2">
                Browse by Game
              </h2>
              <p className="font-body text-text-muted">Find cards from your favorite TCG</p>
            </div>
            <Link to="/marketplace" className="font-body text-sm text-pokemon hover:underline hidden md:block">
              View all →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(GAME_COLORS).slice(0, 6).map(([game, color]) => (
              <Link
                key={game}
                to={`/marketplace?game=${game}`}
                className="group relative p-6 bg-surface-elevated rounded-2xl border border-border hover:border-transparent transition-all hover:shadow-xl"
                style={{ '--hover-color': color } as React.CSSProperties}
              >
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ background: `radial-gradient(circle at center, ${color}40 0%, transparent 70%)` }}
                />
                <div className="relative text-center">
                  <div 
                    className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: color + '20', color }}
                  >
                    {game === 'pokemon' && '⚡'}
                    {game === 'yugioh' && '👑'}
                    {game === 'onepiece' && '☠️'}
                    {game === 'dragonball' && '🐉'}
                    {game === 'magic' && '✨'}
                    {game === 'other' && '🃏'}
                  </div>
                  <div className="font-body font-semibold text-text">{GAME_LABELS[game]}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      {featuredCards.length > 0 && (
        <section className="py-20 bg-surface-elevated/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-2">
                  Featured Cards
                </h2>
                <p className="font-body text-text-muted">Fresh listings from top sellers</p>
              </div>
              <Link to="/marketplace" className="font-body text-sm text-pokemon hover:underline">
                View all →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCards.map((card) => (
                <Link
                  key={card._id}
                  to={`/marketplace/${card._id}`}
                  className="group bg-surface-elevated rounded-2xl border border-border overflow-hidden hover:border-pokemon/50 transition-all hover:shadow-lg hover:shadow-pokemon/10"
                >
                  <div className="aspect-[3/4] bg-surface relative">
                    {card.images[0] ? (
                      <img 
                        src={card.images[0]} 
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🃏
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <GameBadge game={card.game} />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-body text-sm font-semibold text-text truncate mb-1">
                      {card.title}
                    </div>
                    <div className="font-display text-lg font-bold text-pokemon">
                      ${card.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="relative bg-surface-elevated rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                radial-gradient(circle at 0% 100%, rgba(255,215,0,0.4) 0%, transparent 50%),
                radial-gradient(circle at 100% 0%, rgba(139,92,246,0.3) 0%, transparent 50%)
              `
            }} />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
                Ready to Start Trading?
              </h2>
              <p className="font-body text-text-muted mb-8">
                Join thousands of collectors buying, selling, and trading cards every day.
              </p>
              <SignedOut>
                <SignInButton>
                  <button className="font-body bg-pokemon text-surface px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                    Create Free Account
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pokemon rounded flex items-center justify-center">
                <span className="font-display font-bold text-surface text-xs">T</span>
              </div>
              <span className="font-display text-sm font-bold text-text">TradeUp</span>
            </div>
            <p className="font-body text-xs text-text-muted">
              © 2026 TradeUp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}