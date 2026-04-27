import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, SignedIn } from '@clerk/clerk-react';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS, CONDITION_LABELS } from '../lib/constants';

interface CardDetail {
  _id: string;
  title: string;
  game: string;
  set: string;
  cardNumber?: string;
  condition: string;
  price: number;
  currency: string;
  images: string[];
  description?: string;
  views: number;
  sellerId: {
    _id: string;
    username: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
  };
  createdAt: string;
}

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['card', id],
    queryFn: () => api.get<{ data: CardDetail }>(`/cards/${id}`),
    enabled: !!id,
  });
  
  const buyMutation = useMutation({
    mutationFn: () => api.post<{ data: { sessionId: string; url: string } }>('/orders/checkout-session', {
      cardId: id,
      shippingAddress: {
        street: 'Default',
        city: 'Default',
        country: 'US',
        zip: '00000',
      },
    }),
    onSuccess: (data) => {
      if (data.data.url) {
        window.location.href = data.data.url;
      }
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });
  
  const card = data?.data;
  
  const handleBuy = async () => {
    if (!userId) {
      navigate('/sign-in');
      return;
    }
    
    setIsSubmitting(true);
    buyMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-[3/4] bg-surface-elevated rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-surface-elevated rounded w-3/4" />
                <div className="h-12 bg-surface-elevated rounded w-1/3" />
                <div className="h-24 bg-surface-elevated rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !card) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="font-display text-2xl font-bold text-text mb-2">Card not found</div>
          <Link to="/marketplace" className="text-pokemon hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwner = userId && card.sellerId?._id === userId;
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <nav className="flex items-center gap-2 font-body text-sm text-text-muted">
          <Link to="/marketplace" className="hover:text-text">Marketplace</Link>
          <span>/</span>
          <span className="text-text">{card.title}</span>
        </nav>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-surface-elevated rounded-2xl overflow-hidden border border-border">
              {card.images.length > 0 ? (
                <img
                  src={card.images[selectedImage]}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🃏
                </div>
              )}
            </div>
            
            {card.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {card.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-pokemon' : 'border-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${card.title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-1 text-xs font-semibold rounded"
                  style={{ 
                    backgroundColor: GAME_COLORS[card.game] + '20',
                    color: GAME_COLORS[card.game],
                    border: `1px solid ${GAME_COLORS[card.game]}40`
                  }}
                >
                  {GAME_LABELS[card.game]}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-surface-elevated text-text-muted rounded">
                  {CONDITION_LABELS[card.condition]}
                </span>
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-2">
                {card.title}
              </h1>
              
              <p className="font-body text-text-muted">
                {card.set}
                {card.cardNumber && ` #${card.cardNumber}`}
              </p>
            </div>
            
            <div className="flex items-baseline gap-4">
              <span className="font-display text-4xl font-bold text-pokemon">
                ${card.price}
              </span>
              <span className="font-body text-text-muted">{card.currency}</span>
            </div>
            
            {/* Description */}
            {card.description && (
              <div>
                <h2 className="font-body text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Description
                </h2>
                <p className="font-body text-text whitespace-pre-wrap">
                  {card.description}
                </p>
              </div>
            )}
            
            {/* Seller Info */}
            {card.sellerId && (
              <div className="bg-surface-elevated rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface overflow-hidden">
                    {card.sellerId.avatar ? (
                      <img src={card.sellerId.avatar} alt={card.sellerId.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/users/${card.sellerId.username}`}
                        className="font-body font-semibold text-text hover:text-pokemon"
                      >
                        {card.sellerId.username}
                      </Link>
                      {card.sellerId.isVerified && (
                        <span className="text-blue-400" title="Verified Seller">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="font-body text-sm text-text-muted ml-1">
                          {card.sellerId.rating?.toFixed(1) || 'New'}
                        </span>
                      </div>
                      <span className="text-text-muted">•</span>
                      <span className="font-body text-sm text-text-muted">
                        {card.sellerId.reviewCount || 0} reviews
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link
                  to={`/users/${card.sellerId.username}`}
                  className="block mt-4 text-center py-2 border border-border rounded-lg font-body text-sm text-text-muted hover:text-text hover:border-text transition-colors"
                >
                  View Profile
                </Link>
              </div>
            )}
            
            {/* Actions */}
            <SignedIn>
              {isOwner ? (
                <div className="p-4 bg-surface-elevated rounded-xl border border-border text-center">
                  <p className="font-body text-text-muted">This is your listing</p>
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-pokemon text-surface font-body font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Buy Now'}
                </button>
              )}
            </SignedIn>
            
            <SignedIn>
              {!isOwner && (
                <button
                  onClick={() => navigate('/sign-in')}
                  className="w-full py-4 border border-border text-text font-body font-semibold rounded-xl hover:bg-surface-hover transition-colors"
                >
                  Sign in to Buy
                </button>
              )}
            </SignedIn>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
              <div className="text-center">
                <div className="font-body text-lg text-text-muted">{card.views}</div>
                <div className="font-body text-xs text-text-muted uppercase">views</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}