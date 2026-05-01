import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { applyTheme, getStoredTheme } from './utils/theme'

export default function App() {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}