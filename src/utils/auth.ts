const AUTH_STORAGE_KEY = 'scheduler_auth'
const AUTH_CHANGED_EVENT = 'auth:changed'
const SESSION_DURATION_MS = 60 * 60 * 1000

export type Session = {
  token: string
  userId: number
  role: 'professional'
  fullName: string
  email: string
  expiresAt: number
  businessName?: string
  specialty?: string
}

type SaveSessionInput = Omit<Session, 'expiresAt'> | Session

type SignInInput = {
  token: string
  userId: number
  fullName: string
  email: string
  businessName?: string
  specialty?: string
}

function dispatchAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAuthChangedEventName() {
  return AUTH_CHANGED_EVENT
}

export function saveSession(session: SaveSessionInput) {
  const expiresAt =
    'expiresAt' in session && typeof session.expiresAt === 'number'
      ? session.expiresAt
      : Date.now() + SESSION_DURATION_MS

  const normalized: Session = {
    token: session.token,
    userId: session.userId,
    role: 'professional',
    fullName: session.fullName,
    email: session.email,
    expiresAt,
    businessName: session.businessName,
    specialty: session.specialty,
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized))
  dispatchAuthChanged()
}

export function signIn(data: SignInInput) {
  saveSession({
    token: data.token,
    userId: data.userId,
    role: 'professional',
    fullName: data.fullName,
    email: data.email,
    businessName: data.businessName,
    specialty: data.specialty,
  })
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<Session>

    if (
      !parsed ||
      typeof parsed.token !== 'string' ||
      typeof parsed.userId !== 'number' ||
      typeof parsed.fullName !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      clearStoredSession()
      return null
    }

    if (parsed.expiresAt <= Date.now()) {
      clearStoredSession()
      dispatchAuthChanged()
      return null
    }

    return {
      token: parsed.token,
      userId: parsed.userId,
      role: 'professional',
      fullName: parsed.fullName,
      email: parsed.email,
      expiresAt: parsed.expiresAt,
      businessName: parsed.businessName,
      specialty: parsed.specialty,
    }
  } catch {
    clearStoredSession()
    return null
  }
}

export function getCurrentUser() {
  return getSession()
}

export function getCurrentRole() {
  return getSession()?.role ?? null
}

export function isAuthenticated() {
  return getSession() !== null
}

export function getAuthToken() {
  return getSession()?.token ?? ''
}

export function getCurrentUserId() {
  return getSession()?.userId ?? 1
}

export function signOut() {
  clearStoredSession()
  dispatchAuthChanged()
}

export function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}