import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth, SignedIn } from '@clerk/clerk-react';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS } from '../lib/constants';

interface UserProfile {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  activeListings: number;
  activeTrades: number;
  listings: { _id: string; title: string; game: string; price: number; images: string[] }[];
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerId: { username: string; avatar?: string };
}

export default function UserProfile() {
  const { username } = useParams();
  const { userId } = useAuth();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => api.get<{ data: UserProfile }>(`/users/${username}`),
    enabled: !!username,
  });
  
  const { data: reviewsData } = useQuery({
    queryKey: ['user-reviews', profile?.data?._id],
    queryFn: () => api.get<{ data: Review[] }>(`/users/${profile?.data?._id}/reviews`),
    enabled: !!profile?.data?._id,
  });
  
  const user = profile?.data;
  const reviews = reviewsData?.data || [];
  const isOwnProfile = userId && userId === user?._id;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-32 bg-surface-elevated rounded mb-6" />
          <div className="h-64 bg-surface-elevated rounded" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="font-display text-2xl font-bold text-text mb-2">User not found</div>
          <Link to="/" className="text-pokemon hover:underline">← Back home</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="bg-surface-elevated rounded-2xl p-6 border border-border mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-surface overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-text">{user.username}</h1>
                {user.isVerified && <span className="text-blue-400" title="Verified">✓</span>}
              </div>
              {user.bio && <p className="font-body text-text-muted mb-3">{user.bio}</p>}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="font-body text-sm text-text-muted ml-1">{user.rating?.toFixed(1) || 'New'}</span>
                  <span className="font-body text-sm text-text-muted">({user.reviewCount || 0})</span>
                </div>
                <div className="font-body text-sm text-text-muted">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="font-display text-xl font-bold text-text">{user.activeListings || 0}</div>
              <div className="font-body text-xs text-text-muted">Listings</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold text-text">{user.activeTrades || 0}</div>
              <div className="font-body text-xs text-text-muted">Trades</div>
            </div>
          </div>
        </div>
        
        {/* Reviews */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-text mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review._id} className="bg-surface-elevated rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-surface overflow-hidden">
                      {review.reviewerId?.avatar ? (
                        <img src={review.reviewerId.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                      )}
                    </div>
                    <span className="font-body text-sm text-text">{review.reviewerId?.username}</span>
                    <div className="flex text-yellow-400 text-xs">{'★'.repeat(review.rating)}</div>
                  </div>
                  {review.comment && <p className="font-body text-sm text-text-muted">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="font-body text-text-muted text-center py-8">No reviews yet</div>
          )}
        </div>
        
        {/* Listings */}
        <div>
          <h2 className="font-display text-xl font-bold text-text mb-4">Active Listings</h2>
          {user.listings?.length ? (
            <div className="grid grid-cols-2 gap-4">
              {user.listings.map((listing) => (
                <Link
                  key={listing._id}
                  to={`/marketplace/${listing._id}`}
                  className="bg-surface-elevated rounded-xl border border-border overflow-hidden hover:border-pokemon/50 transition-all"
                >
                  <div className="aspect-[3/4] bg-surface relative">
                    {listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🃏</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-body text-sm text-text truncate">{listing.title}</div>
                    <div className="font-display text-lg font-bold text-pokemon">${listing.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="font-body text-text-muted text-center py-8">No active listings</div>
          )}
        </div>
      </div>
    </div>
  );
}