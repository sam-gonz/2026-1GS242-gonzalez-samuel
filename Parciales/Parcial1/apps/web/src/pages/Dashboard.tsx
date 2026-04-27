import { Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GAME_COLORS, GAME_LABELS, STATUS_LABELS } from '../lib/constants';

interface DashboardStats {
  activeListings: number;
  pendingOrders: number;
  unreadNotifications: number;
  rating: number;
}

interface Order {
  _id: string;
  status: string;
  amount: number;
  createdAt: string;
}

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<{ data: DashboardStats }>('/users/me'),
    enabled: !!userId,
  });
  
  const { data: ordersData } = useQuery({
    queryKey: ['dashboard', 'orders'],
    queryFn: () => api.get<{ data: Order[] }>('/orders'),
  });
  
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ data: { isRead: boolean }[] }>('/notifications'),
  });
  
  const pendingOrders = ordersData?.data?.filter(o => o.status === 'paid' || o.status === 'shipped') || [];
  const unreadNotifs = notificationsData?.data?.filter(n => !n.isRead).length || 0;
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-text">Dashboard</h1>
            <p className="font-body text-text-muted">Manage your trades and listings</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/dashboard/listings" className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-pokemon/50 transition-all">
            <div className="font-display text-3xl font-bold text-text mb-1">{stats?.data?.activeListings || 0}</div>
            <div className="font-body text-sm text-text-muted">Active Listings</div>
          </Link>
          
          <Link to="/dashboard/orders" className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-pokemon/50 transition-all">
            <div className="font-display text-3xl font-bold text-text mb-1">{pendingOrders.length}</div>
            <div className="font-body text-sm text-text-muted">Pending Orders</div>
          </Link>
          
          <Link to="/dashboard/notifications" className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-pokemon/50 transition-all">
            <div className="font-display text-3xl font-bold text-text mb-1">{unreadNotifs}</div>
            <div className="font-body text-sm text-text-muted">Notifications</div>
          </Link>
          
          <div className="bg-surface-elevated rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-display text-3xl font-bold text-yellow-400">★</span>
              <span className="font-display text-3xl font-bold text-text">{stats?.data?.rating?.toFixed(1) || 'New'}</span>
            </div>
            <div className="font-body text-sm text-text-muted">Your Rating</div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link 
            to="/dashboard/listings/new" 
            className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-pokemon/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pokemon/20 flex items-center justify-center text-2xl">
                ➕
              </div>
              <div>
                <div className="font-body font-semibold text-text group-hover:text-pokemon">List a Card</div>
                <div className="font-body text-sm text-text-muted">Sell a card from your collection</div>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/trades" 
            className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-pokemon/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                🔄
              </div>
              <div>
                <div className="font-body font-semibold text-text group-hover:text-purple-400">Trade</div>
                <div className="font-body text-sm text-text-muted">Create a trade post</div>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/orders" 
            className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-pokemon/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <div className="font-body font-semibold text-text group-hover:text-blue-400">Orders</div>
                <div className="font-body text-sm text-text-muted">View your orders</div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-xl font-bold text-text">Recent Orders</h2>
          </div>
          
          {ordersData?.data?.length ? (
            <div className="divide-y divide-border">
              {ordersData.data.slice(0, 5).map((order) => (
                <div key={order._id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-body text-sm text-text">Order #{order._id.slice(-6)}</div>
                    <div className="font-body text-xs text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-text">${order.amount}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'paid' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="font-body text-text-muted">No orders yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}