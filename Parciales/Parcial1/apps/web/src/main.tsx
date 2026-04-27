import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const rootEl = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootEl);

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const useClerk = !!clerkKey && !clerkKey.includes('pk_test') && !clerkKey.includes('...');

const appTree = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

if (useClerk) {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkKey!}>
        {appTree}
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  console.warn('Clerk publishable key missing or looks like a placeholder; rendering without ClerkProvider. Add a valid VITE_CLERK_PUBLISHABLE_KEY to .env to enable Clerk features.');
  root.render(
    <React.StrictMode>
      {appTree}
    </React.StrictMode>
  );
}