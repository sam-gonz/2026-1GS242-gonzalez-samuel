import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import './styles/globals.css'

import Home       from './routes/index'
import Login      from './routes/login'
import Lobby      from './routes/lobby'
import TeamSelect from './routes/select'
import Battle     from './routes/battle'
import Shop       from './routes/shop'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/shop"          element={<Shop />} />
          <Route path="/lobby/:code"   element={<Lobby />} />
          <Route path="/select/:code"  element={<TeamSelect />} />
          <Route path="/battle/:code"  element={<Battle />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
)
