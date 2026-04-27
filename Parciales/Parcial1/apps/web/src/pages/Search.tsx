import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS, CONDITION_LABELS } from '../lib/constants';

interface SearchResult {
  type: 'card' | 'trade';
  _id: string;
  title: string;
  game: string;
  price?: number;
  images?: string[];
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [searched, setSearched] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get<{ data: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`),
    enabled: queried && query.length > 0,
  });
  
  const results = data?.data || [];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setSearchParams({ q: input });
  };
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-display text-2xl font-bold text-text mb-6">Search</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search cards and trades..."
            className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50"
          />
        </form>
        
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, i) => (
              <Link
                key={result._id}
                to={result.type === 'card' ? `/marketplace/${result._id}` : `/trades/${result._id}`}
                className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl border border-border hover:border-pokemon/50 transition-all"
              >
                <div className="w-12 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                  {result.images?.[0] ? (
                    <img src={result.images[0]} alt={result.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      {result.type === 'card' ? '🃏' : '🔄'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-body font-semibold text-text">{result.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: GAME_COLORS[result.game] }}
                    />
                    <span className="font-body text-xs text-text-muted">{GAME_LABELS[result.game]}</span>
                    <span className="font-body text-xs text-text-muted">•</span>
                    <span className="font-body text-xs text-text-muted capitalize">{result.type}</span>
                  </div>
                </div>
                {result.price && (
                  <div className="font-display font-bold text-pokemon">${result.price}</div>
                )}
              </Link>
            ))}
          </div>
        ) : searched && query ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔍</div>
            <div className="font-body text-text-muted">No results found for "{query}"</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}