import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { api } from './utils/api'
import { getAuthChangedEventName, getSession } from './utils/auth'
import {
  applyAccentColor,
  applyTheme,
  getStoredAccentColor,
  getStoredTheme,
  initializeTheme,
} from './utils/theme'
import { clearCompanyLogo } from './utils/branding'
import { persistVisualSettings } from './utils/visualSettings'
import type { Settings } from './types/settings.types'

export default function App() {
  useEffect(() => {
    initializeTheme()

    async function loadVisualSettings() {
      const session = getSession()

      if (!session) {
        applyTheme(getStoredTheme())
        applyAccentColor(getStoredAccentColor())
        clearCompanyLogo()
        return
      }

      try {
        const settingsUserId =
          session.role === 'client'
            ? session.professionalUserId ?? session.userId
            : session.userId

        const settings = await api.get<Settings>(
          `/api/settings?userId=${settingsUserId}`
        )

        persistVisualSettings(settings)
      } catch {
        applyTheme(getStoredTheme())
        applyAccentColor(getStoredAccentColor())
      }
    }

    loadVisualSettings()

    window.addEventListener(getAuthChangedEventName(), loadVisualSettings)
    window.addEventListener('storage', loadVisualSettings)

    return () => {
      window.removeEventListener(getAuthChangedEventName(), loadVisualSettings)
      window.removeEventListener('storage', loadVisualSettings)
    }
  }, [])

  return <AppRoutes />
}
