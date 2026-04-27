import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  status: string;
  views: number;
}

export default function DashboardListings() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => api.get<{ data: Card[] }>('/cards/me'),
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-cards'] }),
  });
  
  const cards = data?.data || [];
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/dashboard" className="font-body text-sm text-text-muted hover:text-text mb-2 inline-block">
              ← Dashboard
            </Link>
            <h1 className="font-display text-2xl font-bold text-text">My Listings</h1>
          </div>
          <Link to="/dashboard/listings/new" className="px-4 py-2 bg-pokemon text-surface font-body text-sm font-semibold rounded-lg hover:opacity-90">
            + New Listing
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl p-4 animate-pulse flex gap-4">
                <div className="w-20 h-28 bg-surface rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-1/4" />
                  <div className="h-6 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card._id} className="bg-surface-elevated rounded-xl p-4 border border-border flex gap-4">
                <div className="w-20 h-28 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                  {card.images[0] ? (
                    <img src={card.images[0]} alt={card.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded" style={{ backgroundColor: GAME_COLORS[card.game] + '20', color: GAME_COLORS[card.game] }}>
                          {GAME_LABELS[card.game]}
                        </span>
                        <span className="font-body text-xs text-text-muted">{CONDITION_LABELS[card.condition]}</span>
                      </div>
                      <div className="font-body font-semibold text-text">{card.title}</div>
                      <div className="font-body text-sm text-text-muted">{card.set}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl font-bold text-pokemon">${card.price}</div>
                      <div className="font-body text-xs text-text-muted">{card.views} views</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link to={`/marketplace/${card._id}`} className="px-3 py-1.5 border border-border rounded-lg font-body text-xs text-text-muted hover:text-text">
                      View
                    </Link>
                    <button
                      onClick={() => deleteMutation.mutate(card._id)}
                      className="px-3 py-1.5 border border-border rounded-lg font-body text-xs text-error hover:bg-error/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🃏</div>
            <div className="font-display text-xl font-bold text-text mb-2">No listings yet</div>
            <div className="font-body text-text-muted mb-4">Start selling cards from your collection</div>
            <Link to="/dashboard/listings/new" className="inline-block px-6 py-3 bg-pokemon text-surface font-body font-semibold rounded-xl">
              Create First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}