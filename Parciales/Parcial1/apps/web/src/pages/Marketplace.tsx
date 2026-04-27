import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS, CONDITION_LABELS } from '../lib/constants';

interface Card {
  _id: string;
  title: string;
  game: string;
  set: string;
  condition: string;
  price: number;
  currency: string;
  images: string[];
  sellerId: { username: string; rating: number };
}

function FilterSection({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode 
}) {
  return (
    <div className="mb-6">
      <h3 className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function GameFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('game') || '';
  
  const games = ['pokemon', 'yugioh', 'onepiece', 'dragonball', 'magic', 'other'];
  
  return (
    <div className="space-y-2">
      {games.map((game) => {
        const isSelected = selected === game;
        return (
          <button
            key={game}
            onClick={() => {
              if (isSelected) {
                searchParams.delete('game');
              } else {
                searchParams.set('game', game);
              }
              searchParams.set('page', '1');
              setSearchParams(searchParams);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left font-body text-sm transition-all ${
              isSelected 
                ? 'bg-surface-hover text-text' 
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            <span 
              className={`w-3 h-3 rounded-full border transition-all ${
                isSelected ? 'border-pokemon bg-pokemon' : 'border-border'
              }`}
              style={{ 
                borderColor: isSelected ? undefined : GAME_COLORS[game]
              }}
            />
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: GAME_COLORS[game] }}
            />
            {GAME_LABELS[game]}
          </button>
        );
      })}
    </div>
  );
}

function ConditionFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('condition') || '';
  
  const conditions = ['mint', 'near-mint', 'excellent', 'good', 'played', 'poor'];
  
  return (
    <div className="space-y-2">
      {conditions.map((condition) => {
        const isSelected = selected === condition;
        return (
          <button
            key={condition}
            onClick={() => {
              if (isSelected) {
                searchParams.delete('condition');
              } else {
                searchParams.set('condition', condition);
              }
              searchParams.set('page', '1');
              setSearchParams(searchParams);
            }}
            className={`w-full px-3 py-2 rounded-lg text-left font-body text-sm transition-all ${
              isSelected 
                ? 'bg-surface-hover text-text' 
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            {CONDITION_LABELS[condition]}
          </button>
        );
      })}
    </div>
  );
}

function PriceFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  
  const presets = [
    { label: 'Under $10', min: '', max: '10' },
    { label: '$10 - $50', min: '10', max: '50' },
    { label: '$50 - $100', min: '50', max: '100' },
    { label: '$100+', min: '100', max: '' },
  ];
  
  return (
    <div className="space-y-2">
      {presets.map((preset) => {
        const isSelected = priceMin === preset.min && priceMax === preset.max;
        return (
          <button
            key={preset.label}
            onClick={() => {
              if (isSelected) {
                searchParams.delete('priceMin');
                searchParams.delete('priceMax');
              } else {
                if (preset.min) searchParams.set('priceMin', preset.min);
                else searchParams.delete('priceMin');
                if (preset.max) searchParams.set('priceMax', preset.max);
                else searchParams.delete('priceMax');
              }
              searchParams.set('page', '1');
              setSearchParams(searchParams);
            }}
            className={`w-full px-3 py-2 rounded-lg text-left font-body text-sm transition-all ${
              isSelected 
                ? 'bg-surface-hover text-text' 
                : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

function CardGridItem({ card }: { card: Card }) {
  return (
    <Link
      to={`/marketplace/${card._id}`}
      className="group bg-surface-elevated rounded-2xl border border-border overflow-hidden hover:border-pokemon/50 transition-all hover:shadow-lg hover:shadow-pokemon/10"
    >
      <div className="aspect-[3/4] bg-surface relative overflow-hidden">
        {card.images[0] ? (
          <img 
            src={card.images[0]} 
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🃏
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className="px-2 py-0.5 text-xs font-semibold rounded"
            style={{ 
              backgroundColor: GAME_COLORS[card.game] + '20',
              color: GAME_COLORS[card.game],
              border: `1px solid ${GAME_COLORS[card.game]}40`
            }}
          >
            {GAME_LABELS[card.game]}
          </span>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-0.5 text-xs font-medium bg-surface/80 backdrop-blur text-text-muted rounded">
            {CONDITION_LABELS[card.condition]}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="font-body text-xs text-text-muted mb-1 truncate">
          {card.set}
        </div>
        <div className="font-body text-sm font-semibold text-text truncate mb-2">
          {card.title}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold text-pokemon">
            ${card.price}
          </div>
          {card.sellerId && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="font-body text-xs text-text-muted">
                {card.sellerId.rating?.toFixed(1) || 'New'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🃏</div>
      <div className="font-display text-xl font-bold text-text mb-2">
        No cards found
      </div>
      <div className="font-body text-text-muted">
        Try adjusting your filters or search query
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-surface-elevated rounded-2xl overflow-hidden">
          <div className="aspect-[3/4] bg-surface animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-surface rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-surface rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const queryString = searchParams.toString();
  
  const { data, isLoading } = useQuery({
    queryKey: ['cards', queryString],
    queryFn: () => api.get<{ data: Card[]; pagination: { page: number; total: number; pages: number } }>(
      `/cards?${queryString}`
    ),
  });
  
  const cards = data?.data || [];
  const pagination = data?.pagination;
  
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };
  
  const hasFilters = searchParams.toString().length > 0;
  
  return (
    <div className="min-h-screen bg-surface">
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
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-text-muted hover:text-text"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search cards..."
              value={searchParams.get('search') || ''}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('search', e.target.value);
                } else {
                  params.delete('search');
                }
                params.set('page', '1');
                setSearchParams(params);
              }}
              className="w-full bg-surface-elevated border border-border rounded-xl py-3 pl-12 pr-4 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50 transition-colors"
            />
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-0 z-50 lg:z-0 w-64 lg:w-72 bg-surface lg:bg-transparent p-6 lg:p-0 overflow-y-auto
            transition-transform duration-300 transform
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="font-display text-xl font-bold text-text">Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-text-muted">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full mb-6 py-2 text-center font-body text-sm text-error hover:underline"
              >
                Clear all filters
              </button>
            )}
            
            <FilterSection title="Game">
              <GameFilter />
            </FilterSection>
            
            <FilterSection title="Condition">
              <ConditionFilter />
            </FilterSection>
            
            <FilterSection title="Price">
              <PriceFilter />
            </FilterSection>
          </aside>
          
          {/* Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-surface/80 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="font-body text-sm text-text-muted">
                {pagination?.total 
                  ? `${pagination.total} cards found`
                  : 'Loading...'
                }
              </div>
              
              <select
                value={searchParams.get('sort') || 'newest'}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('sort', e.target.value);
                  setSearchParams(params);
                }}
                className="bg-surface-elevated border border-border rounded-lg px-3 py-2 font-body text-sm text-text focus:outline-none focus:border-pokemon/50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            
            {isLoading ? (
              <LoadingSkeleton />
            ) : cards.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cards.map((card) => (
                    <CardGridItem key={card._id} card={card} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', String(currentPage - 1));
                        setSearchParams(params);
                      }}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover"
                    >
                      ←
                    </button>
                    <span className="font-body text-sm text-text-muted">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', String(currentPage + 1));
                        setSearchParams(params);
                      }}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}