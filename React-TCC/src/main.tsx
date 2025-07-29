import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Fase1 from './Fase_1/Fase_1'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fase1 />
  </StrictMode>,
)
