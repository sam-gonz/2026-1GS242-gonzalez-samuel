import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import api from '../lib/api';
import { STATUS_LABELS } from '../lib/constants';

interface OrderConfirmation {
  _id: string;
  status: string;
  amount: number;
  currency: string;
  cardId: { title: string; images: string[] };
  sellerId: { username: string };
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const { isLoaded } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<{ data: OrderConfirmation }>(`/orders/${id}`),
    enabled: !!id && isLoaded,
  });
  
  const order = data?.data;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center text-4xl">
            ✓
          </div>
          <h1 className="font-display text-3xl font-bold text-text mb-2">Order Confirmed!</h1>
          <p className="font-body text-text-muted">Thank you for your purchase</p>
        </div>
        
        {order && (
          <div className="bg-surface-elevated rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-24 bg-surface rounded-lg overflow-hidden">
                {order.cardId?.images?.[0] ? (
                  <img src={order.cardId.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
                )}
              </div>
              <div>
                <div className="font-body font-semibold text-text">{order.cardId?.title}</div>
                <div className="font-body text-sm text-text-muted">Seller: {order.sellerId?.username}</div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="font-body text-text-muted">Total</span>
              <span className="font-display text-2xl font-bold text-pokemon">${order.amount}</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <Link to="/dashboard/orders" className="w-full py-3 text-center bg-pokemon text-surface font-body font-semibold rounded-xl hover:opacity-90">
            View My Orders
          </Link>
          <Link to="/marketplace" className="w-full py-3 text-center border border-border text-text font-body font-semibold rounded-xl hover:bg-surface-hover">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}