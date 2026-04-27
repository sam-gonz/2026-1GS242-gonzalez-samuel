import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/api';

export default function DashboardProfile() {
  const { user, isLoaded } = useAuth();
  const [bio, setBio] = useState('');
  
  const updateMutation = useMutation({
    mutationFn: (data: { bio: string }) => api.patch('/users/me', data),
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ bio });
  };
  
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <Link to="/dashboard" className="font-body text-sm text-text-muted hover:text-text mb-4 inline-block">
          ← Dashboard
        </Link>
        
        <h1 className="font-display text-2xl font-bold text-text mb-6">Edit Profile</h1>
        
        <div className="bg-surface-elevated rounded-2xl p-6 border border-border mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-surface overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
              )}
            </div>
            <div>
              <div className="font-display text-xl font-bold text-text">{user?.username || 'User'}</div>
              <div className="font-body text-sm text-text-muted">{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </div>
          
          <p className="font-body text-sm text-text-muted">
            Profile information is managed through Clerk. Update your username and avatar at clerk.com
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-surface-elevated rounded-2xl p-6 border border-border">
          <label className="block font-body text-sm font-semibold text-text-muted mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell others about yourself..."
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-body text-text placeholder:text-text-muted focus:outline-none focus:border-pokemon/50 resize-none mb-4"
          />
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-3 bg-pokemon text-surface font-body font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Bio'}
          </button>
        </form>
      </div>
    </div>
  );
}