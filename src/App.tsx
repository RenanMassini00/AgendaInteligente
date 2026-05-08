import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { api } from './utils/api'
import { getCurrentUserId, isAuthenticated } from './utils/auth'
import { applyTheme, getStoredTheme, initializeTheme, setStoredTheme, type AppTheme } from './utils/theme'
import type { Settings } from './types/settings.types'

export default function App() {
  useEffect(() => {
    initializeTheme()

    async function loadTheme() {
      if (!isAuthenticated()) {
        applyTheme(getStoredTheme())
        return
      }

      try {
        const settings = await api.get<Settings>(`/api/settings?userId=${getCurrentUserId()}`)
        const theme = (settings.theme === 'dark' ? 'dark' : 'light') as AppTheme
        setStoredTheme(theme)
      } catch {
        applyTheme(getStoredTheme())
      }
    }

    loadTheme()
  }, [])

  return <AppRoutes />
}