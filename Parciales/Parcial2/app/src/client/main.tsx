import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/globals.css'

import Home       from './routes/index'
import Lobby      from './routes/lobby'
import TeamSelect from './routes/select'
import Battle     from './routes/battle'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/lobby/:code"   element={<Lobby />} />
        <Route path="/select/:code"  element={<TeamSelect />} />
        <Route path="/battle/:code"  element={<Battle />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
