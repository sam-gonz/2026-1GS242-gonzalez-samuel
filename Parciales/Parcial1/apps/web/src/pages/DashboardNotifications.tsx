import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Notification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export default function DashboardNotifications() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ data: Notification[] }>('/notifications'),
  });
  
  const readAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  
  const notifications = data?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/dashboard" className="font-body text-sm text-text-muted hover:text-text mb-2 inline-block">← Dashboard</Link>
            <h1 className="font-display text-2xl font-bold text-text">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={() => readAllMutation.mutate()} className="px-3 py-1.5 border border-border rounded-lg font-body text-xs text-text-muted hover:text-text">
              Mark all read
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-surface rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-4 rounded-xl border ${notif.isRead ? 'bg-surface-elevated border-border' : 'bg-surface-elevated/50 border-pokemon/30'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notif.isRead ? 'bg-transparent' : 'bg-pokemon'}`} />
                  <div className="flex-1">
                    <div className="font-body text-sm text-text">{notif.message}</div>
                    <div className="font-body text-xs text-text-muted mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔔</div>
            <div className="font-body text-text-muted">No notifications</div>
          </div>
        )}
      </div>
    </div>
  );
}