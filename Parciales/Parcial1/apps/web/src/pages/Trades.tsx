import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SignedIn } from '@clerk/clerk-react';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS } from '../lib/constants';

interface TradePost {
  _id: string;
  title: string;
  description?: string;
  haves: { cardName: string; game: string; condition: string; images?: string[] }[];
  wants: { cardName: string; game: string; condition?: string; notes?: string }[];
  status: string;
  offerCount: number;
  userId: { username: string; avatar?: string; rating: number };
  createdAt: string;
}

function TradeCard({ 
  card, 
  type 
}: { 
  card: { cardName: string; game: string; condition: string; images?: string[] }; 
  type: 'have' | 'want';
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
      <div className="w-12 h-16 bg-surface-elevated rounded-lg overflow-hidden flex-shrink-0">
        {card.images?.[0] ? (
          <img src={card.images[0]} alt={card.cardName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            🃏
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-body text-sm font-semibold text-text truncate">
          {card.cardName}
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: GAME_COLORS[card.game] }}
          />
          <span className="font-body text-xs text-text-muted truncate">
            {GAME_LABELS[card.game]}
          </span>
        </div>
      </div>
    </div>
  );
}

function TradeCardItem({ post }: { post: TradePost }) {
  return (
    <Link
      to={`/trades/${post._id}`}
      className="block bg-surface-elevated rounded-2xl border border-border overflow-hidden hover:border-pokemon/50 transition-all"
    >
      <div className="p-4">
        <h3 className="font-body text-lg font-semibold text-text mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        {post.description && (
          <p className="font-body text-sm text-text-muted mb-4 line-clamp-2">
            {post.description}
          </p>
        )}
        
        {/* Haves */}
        <div className="mb-3">
          <div className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Offering
          </div>
          <div className="space-y-2">
            {post.haves.slice(0, 3).map((card, i) => (
              <TradeCard key={i} card={card} type="have" />
            ))}
            {post.haves.length > 3 && (
              <div className="font-body text-xs text-text-muted text-center py-1">
                +{post.haves.length - 3} more
              </div>
            )}
          </div>
        </div>
        
        {/* Wants */}
        <div>
          <div className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Looking for
          </div>
          <div className="flex flex-wrap gap-2">
            {post.wants.slice(0, 4).map((card, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-surface rounded-lg font-body text-xs text-text-muted"
              >
                {card.cardName}
              </span>
            ))}
            {post.wants.length > 4 && (
              <span className="px-2 py-1 font-body text-xs text-text-muted">
                +{post.wants.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-surface-elevated overflow-hidden">
            {post.userId.avatar ? (
              <img src={post.userId.avatar} alt={post.userId.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
            )}
          </div>
          <span className="font-body text-sm text-text-muted">{post.userId.username}</span>
        </div>
        <div className="font-body text-sm text-text-muted">
          {post.offerCount} offers
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  const { userId, isLoaded } = useAuth();
  
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔄</div>
      <div className="font-display text-xl font-bold text-text mb-2">
        No trade posts yet
      </div>
      <div className="font-body text-text-muted mb-6">
        Be the first to start a trade!
      </div>
      <SignedIn>
        <Link
          to="/dashboard/trades/new"
          className="inline-block px-6 py-3 bg-pokemon text-surface font-body font-semibold rounded-xl hover:opacity-90"
        >
          Create Trade Post
        </Link>
      </SignedIn>
    </div>
  );
}

export default function Trades() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { data, isLoading } = useQuery({
    queryKey: ['trades', searchParams.toString()],
    queryFn: () => api.get<{ data: TradePost[] }>(`/trades?${searchParams.toString()}`),
  });
  
  const trades = data?.data || [];
  
  const games = ['pokemon', 'yugioh', 'onepiece', 'dragonball', 'magic', 'other'];
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pokemon rounded flex items-center justify-center">
              <span className="font-display font-bold text-surface text-sm">T</span>
            </div>
            <span className="font-display text-xl font-bold text-text">
              Trade<span className="text-pokemon">Up</span>
            </span>
          </Link>
          
          <SignedIn>
            <Link
              to="/dashboard/trades/new"
              className="hidden md:block px-4 py-2 bg-pokemon text-surface font-body text-sm font-semibold rounded-lg hover:opacity-90"
            >
              New Trade
            </Link>
          </SignedIn>
        </div>
        
        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                searchParams.delete('game');
                setSearchParams(searchParams);
              }}
              className={`px-3 py-1.5 rounded-lg font-body text-sm whitespace-nowrap transition-colors ${
                !searchParams.get('game')
                  ? 'bg-pokemon text-surface'
                  : 'bg-surface-elevated text-text-muted hover:text-text'
              }`}
            >
              All
            </button>
            {games.map((game) => (
              <button
                key={game}
                onClick={() => {
                  searchParams.set('game', game);
                  setSearchParams(searchParams);
                }}
                className={`px-3 py-1.5 rounded-lg font-body text-sm whitespace-nowrap transition-colors ${
                  searchParams.get('game') === game
                    ? 'bg-pokemon text-surface'
                    : 'bg-surface-elevated text-text-muted hover:text-text'
                }`}
              >
                {GAME_LABELS[game]}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl p-4 animate-pulse">
                <div className="h-6 bg-surface rounded w-3/4 mb-4" />
                <div className="h-20 bg-surface rounded mb-4" />
                <div className="h-6 bg-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : trades.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trades.map((post) => (
              <TradeCardItem key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}