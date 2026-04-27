import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { STATUS_LABELS } from '../lib/constants';

interface Order {
  _id: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  cardId: { title: string; images: string[] };
  buyerId: { username: string };
  sellerId: { username: string };
}

export default function DashboardOrders() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<string>('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['orders', role],
    queryFn: () => api.get<{ data: Order[] }>(`/orders${role ? `?role=${role}` : ''}`),
  });
  
  const shipMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/orders/${id}/ship`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
  
  const orders = data?.data || [];
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/dashboard" className="font-body text-sm text-text-muted hover:text-text mb-2 inline-block">← Dashboard</Link>
            <h1 className="font-display text-2xl font-bold text-text">Orders</h1>
          </div>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setRole('')} className={`px-3 py-1.5 rounded-lg font-body text-sm ${!role ? 'bg-pokemon text-surface' : 'bg-surface-elevated text-text-muted'}`}>All</button>
          <button onClick={() => setRole('buyer')} className={`px-3 py-1.5 rounded-lg font-body text-sm ${role === 'buyer' ? 'bg-pokemon text-surface' : 'bg-surface-elevated text-text-muted'}`}>Purchases</button>
          <button onClick={() => setRole('seller')} className={`px-3 py-1.5 rounded-lg font-body text-sm ${role === 'seller' ? 'bg-pokemon text-surface' : 'bg-surface-elevated text-text-muted'}`}>Sales</button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl p-4 animate-pulse flex gap-4">
                <div className="w-16 h-24 bg-surface rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-1/2" />
                  <div className="h-6 bg-surface rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-surface-elevated rounded-xl p-4 border border-border flex gap-4">
                <div className="w-16 h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                  {order.cardId?.images?.[0] ? (
                    <img src={order.cardId.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-body font-semibold text-text">{order.cardId?.title || 'Unknown Card'}</div>
                      <div className="font-body text-xs text-text-muted mt-1">
                        {order.buyerId?.username !== 'unknown' && `Buyer: ${order.buyerId?.username}`}
                        {order.sellerId?.username !== 'unknown' && `Seller: ${order.sellerId?.username}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-pokemon">${order.amount}</div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'paid' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                  {order.status === 'paid' && (
                    <button
                      onClick={() => shipMutation.mutate(order._id)}
                      className="mt-3 px-3 py-1.5 bg-blue-500 text-surface font-body text-xs rounded-lg hover:opacity-90"
                    >
                      Mark as Shipped
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <div className="font-body text-text-muted">No orders yet</div>
          </div>
        )}
      </div>
    </div>
  );
}