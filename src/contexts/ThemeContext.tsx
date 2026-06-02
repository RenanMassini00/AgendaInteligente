import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'
type ThemeAccent = 'blue' | 'pink'

type ThemeContextData = {
  mode: ThemeMode
  accent: ThemeAccent
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: ThemeAccent) => void
  toggleMode: () => void
}

const STORAGE_KEY = 'scheduler_theme_preferences'

const ThemeContext = createContext<ThemeContextData | undefined>(undefined)

type ThemeProviderProps = {
  children: ReactNode
}

type ThemeStorage = {
  mode: ThemeMode
  accent: ThemeAccent
}

function getInitialTheme(): ThemeStorage {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as ThemeStorage

      return {
        mode: parsed.mode === 'dark' ? 'dark' : 'light',
        accent: parsed.accent === 'pink' ? 'pink' : 'blue',
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    mode: 'light',
    accent: 'blue',
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const initialTheme = getInitialTheme()

  const [mode, setMode] = useState<ThemeMode>(initialTheme.mode)
  const [accent, setAccent] = useState<ThemeAccent>(initialTheme.accent)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.setAttribute('data-accent', accent)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode,
        accent,
      }),
    )
  }, [mode, accent])

  function toggleMode() {
    setMode((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const value = useMemo(
    () => ({
      mode,
      accent,
      setMode,
      setAccent,
      toggleMode,
    }),
    [mode, accent],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }

  return context
}