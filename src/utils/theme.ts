export type AppTheme = 'light' | 'dark'
export type AppAccent =
  | 'blue'
  | 'pink'
  | 'violet'
  | 'emerald'
  | 'cyan'
  | 'amber'
  | 'rose'
  | 'slate'

const THEME_STORAGE_KEY = 'scheduler_theme'
const ACCENT_STORAGE_KEY = 'scheduler_accent'
const ACCENT_VALUES: AppAccent[] = [
  'blue',
  'pink',
  'violet',
  'emerald',
  'cyan',
  'amber',
  'rose',
  'slate',
]

export function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function applyAccentColor(accent: AppAccent) {
  document.documentElement.setAttribute('data-accent', accent)
}

export function getStoredTheme(): AppTheme {
  const value = localStorage.getItem(THEME_STORAGE_KEY)
  return value === 'dark' ? 'dark' : 'light'
}

export function getStoredAccentColor(): AppAccent {
  const value = localStorage.getItem(ACCENT_STORAGE_KEY) as AppAccent | null

  if (value && ACCENT_VALUES.includes(value)) {
    return value
  }

  return 'blue'
}

export function normalizeTheme(theme?: string | null): AppTheme {
  return theme === 'dark' ? 'dark' : 'light'
}

export function normalizeAccentColor(accent?: string | null): AppAccent {
  return accent && ACCENT_VALUES.includes(accent as AppAccent)
    ? (accent as AppAccent)
    : 'blue'
}

export function setStoredTheme(theme: AppTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
}

export function setStoredAccentColor(accent: AppAccent) {
  localStorage.setItem(ACCENT_STORAGE_KEY, accent)
  applyAccentColor(accent)
}

export function initializeTheme() {
  applyTheme(getStoredTheme())
  applyAccentColor(getStoredAccentColor())
}
