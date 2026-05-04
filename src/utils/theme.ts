export type AppTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'scheduler_theme'
const THEME_EVENT = 'scheduler-theme-updated'

export function getStoredTheme(): AppTheme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

export function setStoredTheme(theme: AppTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent<AppTheme>(THEME_EVENT, { detail: theme }))
}

export function initializeTheme() {
  applyTheme(getStoredTheme())
}

export function getThemeEventName() {
  return THEME_EVENT
}
