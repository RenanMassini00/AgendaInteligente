import { setCompanyLogo } from './branding'
import {
  applyAccentColor,
  applyTheme,
  normalizeAccentColor,
  normalizeTheme,
  setStoredAccentColor,
  setStoredTheme,
} from './theme'

export type VisualSettings = {
  theme?: string | null
  accentColor?: string | null
  companyLogoUrl?: string | null
}

type ApplyVisualSettingsOptions = {
  persist?: boolean
  includeLogo?: boolean
  fallback?: boolean
}

export function applyVisualSettings(
  settings: VisualSettings | null | undefined,
  options: ApplyVisualSettingsOptions = {}
) {
  const { persist = false, includeLogo = true, fallback = false } = options

  if (settings?.theme || fallback) {
    const theme = normalizeTheme(settings?.theme)
    if (persist) {
      setStoredTheme(theme)
    } else {
      applyTheme(theme)
    }
  }

  if (settings?.accentColor || fallback) {
    const accent = normalizeAccentColor(settings?.accentColor)
    if (persist) {
      setStoredAccentColor(accent)
    } else {
      applyAccentColor(accent)
    }
  }

  if (includeLogo && (settings?.companyLogoUrl !== undefined || fallback)) {
    setCompanyLogo(settings?.companyLogoUrl)
  }
}

export function persistVisualSettings(settings: VisualSettings | null | undefined) {
  applyVisualSettings(settings, {
    persist: true,
    includeLogo: true,
    fallback: true,
  })
}
