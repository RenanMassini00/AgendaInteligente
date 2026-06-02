import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { api } from './utils/api'
import { isAuthenticated, getCurrentUserId } from './utils/auth'
import {
  applyAccentColor,
  applyTheme,
  getStoredAccentColor,
  getStoredTheme,
  initializeTheme,
  setStoredAccentColor,
  setStoredTheme,
  type AppAccent,
  type AppTheme,
} from './utils/theme'
import { setCompanyLogo, clearCompanyLogo } from './utils/branding'
import type { Settings } from './types/settings.types'

export default function App() {
  useEffect(() => {
    initializeTheme()

    async function loadVisualSettings() {
      if (!isAuthenticated()) {
        applyTheme(getStoredTheme())
        applyAccentColor(getStoredAccentColor())
        clearCompanyLogo()
        return
      }

      try {
        const settings = await api.get<Settings>(
          `/api/settings?userId=${getCurrentUserId()}`
        )

        const theme = (settings.theme === 'dark' ? 'dark' : 'light') as AppTheme
        const accent = (settings.accentColor || 'blue') as AppAccent

        setStoredTheme(theme)
        setStoredAccentColor(accent)
        setCompanyLogo(settings.companyLogoUrl)
      } catch {
        applyTheme(getStoredTheme())
        applyAccentColor(getStoredAccentColor())
      }
    }

    loadVisualSettings()
  }, [])

  return <AppRoutes />
}