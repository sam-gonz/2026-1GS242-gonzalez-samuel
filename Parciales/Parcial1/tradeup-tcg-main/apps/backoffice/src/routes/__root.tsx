import { createRootRoute, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/tanstack-start'
import '../styles/globals.css'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ClerkProvider publishableKey={import.meta.env['VITE_CLERK_PUBLISHABLE_KEY'] ?? ''}>
      <QueryClientProvider client={queryClient}>
        <ScrollRestoration />
        <Outlet />
      </QueryClientProvider>
    </ClerkProvider>
  )
}
