const AUTH_STORAGE_KEY = 'scheduler_auth'

type Session = {
  email: string
}

export function signIn(email: string) {
  const session: Session = { email }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as Session
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function isAuthenticated() {
  return !!getSession()
}