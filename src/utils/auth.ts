const AUTH_STORAGE_KEY = 'scheduler_auth'
const AUTH_CHANGED_EVENT = 'auth:changed'
const SESSION_DURATION_MS = 60 * 60 * 1000

export type SessionRole = 'master_admin' | 'professional' | 'client'

export type Session = {
  token: string
  userId: number
  role: SessionRole
  fullName: string
  email: string
  expiresAt: number
  phone?: string | null
  businessName?: string
  specialty?: string
  timezone?: string | null
  publicSlug?: string | null
  companyId?: number | null
  clientId?: number | null
  professionalUserId?: number | null
  hasAppointmentsModule: boolean
  hasCatalogModule: boolean
}

type SaveSessionInput = Omit<Session, 'expiresAt'> | Session

type SignInInput = {
  token: string
  userId: number
  fullName: string
  email: string
  role: SessionRole
  phone?: string | null
  businessName?: string
  specialty?: string
  timezone?: string | null
  publicSlug?: string | null
  companyId?: number | null
  clientId?: number | null
  professionalUserId?: number | null
  hasAppointmentsModule?: boolean
  hasCatalogModule?: boolean
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
    role: session.role,
    fullName: session.fullName,
    email: session.email,
    phone: session.phone ?? null,
    expiresAt,
    businessName: session.businessName,
    specialty: session.specialty,
    timezone: session.timezone ?? null,
    publicSlug: session.publicSlug ?? null,
    companyId: session.companyId ?? null,
    clientId: session.clientId ?? null,
    professionalUserId: session.professionalUserId ?? null,
    hasAppointmentsModule: session.hasAppointmentsModule,
    hasCatalogModule: session.hasCatalogModule,
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized))
  dispatchAuthChanged()
}

export function signIn(data: SignInInput) {
  saveSession({
    token: data.token,
    userId: data.userId,
    role: data.role,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
    businessName: data.businessName,
    specialty: data.specialty,
    timezone: data.timezone ?? null,
    publicSlug: data.publicSlug ?? null,
    companyId: data.companyId ?? null,
    clientId: data.clientId ?? null,
    professionalUserId: data.professionalUserId ?? null,
    hasAppointmentsModule: data.hasAppointmentsModule ?? data.role !== 'client',
    hasCatalogModule: data.hasCatalogModule ?? false,
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

    const role: SessionRole =
      parsed.role === 'master_admin'
        ? 'master_admin'
        : parsed.role === 'client'
          ? 'client'
          : 'professional'

    if (parsed.expiresAt <= Date.now()) {
      clearStoredSession()
      dispatchAuthChanged()
      return null
    }

    return {
      token: parsed.token,
      userId: parsed.userId,
      role,
      fullName: parsed.fullName,
      email: parsed.email,
      expiresAt: parsed.expiresAt,
      phone: parsed.phone ?? null,
      businessName: parsed.businessName,
      specialty: parsed.specialty,
      timezone: parsed.timezone ?? null,
      publicSlug: parsed.publicSlug ?? null,
      companyId: parsed.companyId ?? null,
      clientId: parsed.clientId ?? null,
      professionalUserId: parsed.professionalUserId ?? null,
      hasAppointmentsModule: parsed.hasAppointmentsModule ?? true,
      hasCatalogModule: parsed.hasCatalogModule ?? false,
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

export function getCurrentProfessionalUserId() {
  const session = getSession()
  return session?.professionalUserId ?? session?.userId ?? 1
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
