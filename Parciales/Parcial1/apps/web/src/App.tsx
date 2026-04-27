import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import CardDetail from './pages/CardDetail';
import Trades from './pages/Trades';
import TradeDetail from './pages/TradeDetail';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import DashboardListings from './pages/DashboardListings';
import DashboardListingsNew from './pages/DashboardListingsNew';
import DashboardTrades from './pages/DashboardTrades';
import DashboardOrders from './pages/DashboardOrders';
import DashboardNotifications from './pages/DashboardNotifications';
import DashboardProfile from './pages/DashboardProfile';
import OrderConfirmation from './pages/OrderConfirmation';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/:id" element={<CardDetail />} />
      <Route path="/trades" element={<Trades />} />
      <Route path="/trades/:id" element={<TradeDetail />} />
      <Route path="/users/:username" element={<UserProfile />} />
      <Route path="/search" element={<Search />} />
      <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
      
      <Route path="/dashboard" element={<SignedIn><Dashboard /></SignedIn>} />
      <Route path="/dashboard/listings" element={<SignedIn><DashboardListings /></SignedIn>} />
      <Route path="/dashboard/listings/new" element={<SignedIn><DashboardListingsNew /></SignedIn>} />
      <Route path="/dashboard/trades" element={<SignedIn><DashboardTrades /></SignedIn>} />
      <Route path="/dashboard/orders" element={<SignedIn><DashboardOrders /></SignedIn>} />
      <Route path="/dashboard/notifications" element={<SignedIn><DashboardNotifications /></SignedIn>} />
      <Route path="/dashboard/profile" element={<SignedIn><DashboardProfile /></SignedIn>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}