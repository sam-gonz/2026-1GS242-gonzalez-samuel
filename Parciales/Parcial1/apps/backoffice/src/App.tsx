import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminListings from './pages/AdminListings';
import AdminOrders from './pages/AdminOrders';
import AdminReviews from './pages/AdminReviews';
import AdminCategories from './pages/AdminCategories';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignedIn><AdminDashboard /></SignedIn>} />
      <Route path="/users" element={<SignedIn><AdminUsers /></SignedIn>} />
      <Route path="/listings" element={<SignedIn><AdminListings /></SignedIn>} />
      <Route path="/orders" element={<SignedIn><AdminOrders /></SignedIn>} />
      <Route path="/reviews" element={<SignedIn><AdminReviews /></SignedIn>} />
      <Route path="/categories" element={<SignedIn><AdminCategories /></SignedIn>} />
      <Route path="/settings" element={<SignedIn><AdminSettings /></SignedIn>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}