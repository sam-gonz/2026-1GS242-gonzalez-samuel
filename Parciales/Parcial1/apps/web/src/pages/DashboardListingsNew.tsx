import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS, CONDITION_LABELS } from '../lib/constants';

const games = ['pokemon', 'yugioh', 'onepiece', 'dragonball', 'magic', 'other'] as const;
const conditions = ['mint', 'near-mint', 'excellent', 'good', 'played', 'poor'] as const;

export default function DashboardListingsNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    game: 'pokemon',
    set: '',
    cardNumber: '',
    condition: 'mint',
    price: '',
    currency: 'USD',
    images: [''],
    description: '',
  });
  
  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/cards', data),
    onSuccess: () => navigate('/dashboard/listings'),
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      images: form.images.filter(Boolean),
    };
    createMutation.mutate(payload);
  };
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <button onClick={() => navigate('/dashboard/listings')} className="font-body text-sm text-text-muted hover:text-text mb-4">
          ← My Listings
        </button>
        
        <h1 className="font-display text-2xl font-bold text-text mb-6">List a Card</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-body text-sm font-semibold text-text-muted mb-2">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Charizard Base Set"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50"
            />
          </div>
          
          {/* Game & Set */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text-muted mb-2">Game *</label>
              <select
                value={form.game}
                onChange={(e) => setForm({ ...form, game: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text focus:outline-none focus:border-pokemon/50"
              >
                {games.map((game) => (
                  <option key={game} value={game}>{GAME_LABELS[game]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text-muted mb-2">Set *</label>
              <input
                type="text"
                required
                value={form.set}
                onChange={(e) => setForm({ ...form, set: e.target.value })}
                placeholder="e.g., Base Set"
                className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50"
              />
            </div>
          </div>
          
          {/* Card Number & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text-muted mb-2">Card #</label>
              <input
                type="text"
                value={form.cardNumber}
                onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                placeholder="e.g., 4/102"
                className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text-muted mb-2">Condition *</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text focus:outline-none focus:border-pokemon/50"
              >
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>{CONDITION_LABELS[cond]}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Price */}
          <div>
            <label className="block font-body text-sm font-semibold text-text-muted mb-2">Price *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-text-muted">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50"
              />
            </div>
          </div>
          
          {/* Image URL */}
          <div>
            <label className="block font-body text-sm font-semibold text-text-muted mb-2">Image URL</label>
            <input
              type="url"
              value={form.images[0]}
              onChange={(e) => setForm({ ...form, images: [e.target.value] })}
              placeholder="https://..."
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block font-body text-sm font-semibold text-text-muted mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Add any details about your card..."
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50 resize-none"
            />
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-4 bg-pokemon text-surface font-body font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}