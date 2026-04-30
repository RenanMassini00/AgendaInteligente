import type { AuthUser, LoginResponse } from '../types/auth.types'

const AUTH_STORAGE_KEY = 'scheduler_session'

export type Session = {
  token: string
  user: AuthUser
}

export function signIn(data: LoginResponse) {
  const session: Session = {
    token: data.token,
    user: data.user,
  }

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

export function getCurrentUser() {
  return getSession()?.user ?? null
}

export function getCurrentUserId() {
  return getSession()?.user.id ?? 0
}

export function getAuthToken() {
  return getSession()?.token ?? ''
}

export function isAuthenticated() {
  return !!getSession()
}
