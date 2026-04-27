import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS, STATUS_LABELS } from '../lib/constants';

interface TradePost {
  _id: string;
  title: string;
  status: string;
  offerCount: number;
  createdAt: string;
}

export default function DashboardTrades() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['my-trades'],
    queryFn: () => api.get<{ data: TradePost[] }>('/trades?mine=true'),
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trades/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-trades'] }),
  });
  
  const trades = data?.data || [];
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/dashboard" className="font-body text-sm text-text-muted hover:text-text mb-2 inline-block">← Dashboard</Link>
            <h1 className="font-display text-2xl font-bold text-text">My Trades</h1>
          </div>
          <Link to="/dashboard/trades/new" className="px-4 py-2 bg-purple-500 text-surface font-body text-sm font-semibold rounded-lg hover:opacity-90">
            + New Trade
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-surface rounded w-1/2 mb-2" />
                <div className="h-4 bg-surface rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : trades.length > 0 ? (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade._id} className="bg-surface-elevated rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <div className="font-body font-semibold text-text">{trade.title}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      trade.status === 'open' ? 'bg-green-500/20 text-green-400' :
                      trade.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {STATUS_LABELS[trade.status]}
                    </span>
                    <span className="font-body text-xs text-text-muted">{trade.offerCount} offers</span>
                    <span className="font-body text-xs text-text-muted">{new Date(trade.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/trades/${trade._id}`} className="px-3 py-1.5 border border-border rounded-lg font-body text-xs text-text-muted hover:text-text">View</Link>
                  <button onClick={() => deleteMutation.mutate(trade._id)} className="px-3 py-1.5 border border-border rounded-lg font-body text-xs text-error hover:bg-error/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔄</div>
            <div className="font-display text-xl font-bold text-text mb-2">No trade posts yet</div>
            <Link to="/dashboard/trades/new" className="inline-block px-6 py-3 bg-purple-500 text-surface font-body font-semibold rounded-xl">Create First Trade</Link>
          </div>
        )}
      </div>
    </div>
  );
}