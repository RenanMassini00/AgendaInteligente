const THEME_STORAGE_KEY = 'scheduler_theme'

export type AppTheme = 'light' | 'dark'

export function getStoredTheme(): AppTheme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)

  if (stored === 'dark') {
    return 'dark'
  }

  return 'light'
}

export function setStoredTheme(theme: AppTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}