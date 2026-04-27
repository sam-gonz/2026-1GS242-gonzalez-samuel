import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth, SignedIn } from '@clerk/clerk-react';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS } from '../lib/constants';

interface TradePostDetail {
  _id: string;
  title: string;
  description?: string;
  haves: { cardName: string; game: string; condition: string; images?: string[] }[];
  wants: { cardName: string; game: string; condition?: string; notes?: string }[];
  status: string;
  offerCount: number;
  userId: { _id: string; username: string; avatar?: string; rating: number };
  createdAt: string;
}

interface TradeOffer {
  _id: string;
  offeringCards: { cardName: string; game: string; condition: string; images?: string[] }[];
  message?: string;
  status: string;
  offererId: { username: string; avatar?: string };
}

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, isLoaded } = useAuth();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['trade', id],
    queryFn: () => api.get<{ data: TradePostDetail }>(`/trades/${id}`),
    enabled: !!id,
  });
  
  const { data: offersData } = useQuery({
    queryKey: ['trade-offers', id],
    queryFn: () => api.get<{ data: TradeOffer[] }>(`/trades/${id}/offers`),
    enabled: !!id && !!userId,
  });
  
  const acceptMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: string }) =>
      api.patch<{ data: TradeOffer }>(`/trades/${id}/offers/${offerId}`, { status }),
  });
  
  const post = data?.data;
  const offers = offersData?.data || [];
  const isOwner = userId && post?.userId?._id === userId;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-surface-elevated rounded w-1/2 mb-8" />
          <div className="h-64 bg-surface-elevated rounded" />
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="font-display text-2xl font-bold text-text mb-2">Trade not found</div>
          <Link to="/trades" className="text-pokemon hover:underline">← Back to Trades</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <Link to="/trades" className="font-body text-sm text-text-muted hover:text-text mb-4 inline-flex items-center gap-1">
          ← Back to Trades
        </Link>
        
        <div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="font-display text-2xl font-bold text-text mb-2">{post.title}</h1>
            {post.description && <p className="font-body text-text-muted">{post.description}</p>}
            
            <div className="flex items-center gap-4 mt-4">
              <Link to={`/users/${post.userId.username}`} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface overflow-hidden">
                  {post.userId.avatar ? (
                    <img src={post.userId.avatar} alt={post.userId.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">👤</div>
                  )}
                </div>
                <span className="font-body text-sm text-text">{post.userId.username}</span>
              </Link>
              <span className="font-body text-sm text-text-muted">•</span>
              <span className="font-body text-sm text-text-muted">{post.offerCount} offers</span>
            </div>
          </div>
          
          {/* Haves */}
          <div className="p-6 border-b border-border">
            <h2 className="font-body text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Offering</h2>
            <div className="grid grid-cols-2 gap-3">
              {post.haves.map((card, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                  <div className="w-10 h-14 bg-surface-elevated rounded-lg overflow-hidden">
                    {card.images?.[0] ? (
                      <img src={card.images[0]} alt={card.cardName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🃏</div>
                    )}
                  </div>
                  <div>
                    <div className="font-body text-sm font-semibold text-text">{card.cardName}</div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GAME_COLORS[card.game] }} />
                      <span className="font-body text-xs text-text-muted">{GAME_LABELS[card.game]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Wants */}
          <div className="p-6">
            <h2 className="font-body text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Looking for</h2>
            <div className="flex flex-wrap gap-2">
              {post.wants.map((card, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GAME_COLORS[card.game] }} />
                  <span className="font-body text-sm text-text">{card.cardName}</span>
                  {card.notes && <span className="font-body text-xs text-text-muted">({card.notes})</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Offers (Owner only) */}
        {isOwner && offers.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-xl font-bold text-text mb-4">Received Offers</h2>
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer._id} className="bg-surface-elevated rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface overflow-hidden">
                        {offer.offererId.avatar ? (
                          <img src={offer.offererId.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                        )}
                      </div>
                      <span className="font-body text-sm text-text">{offer.offererId.username}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      offer.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      offer.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  {offer.message && <p className="font-body text-sm text-text-muted mb-3">{offer.message}</p>}
                  {offer.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptMutation.mutate({ offerId: offer._id, status: 'accepted' })}
                        className="px-3 py-1.5 bg-green-500 text-surface font-body text-sm rounded-lg hover:opacity-90"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => acceptMutation.mutate({ offerId: offer._id, status: 'rejected' })}
                        className="px-3 py-1.5 border border-border text-text font-body text-sm rounded-lg hover:bg-surface-hover"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}