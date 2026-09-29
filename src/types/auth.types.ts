export type UserRole = 'professional' | 'employee' | 'client' | 'master_admin'

export type AuthUser = {
  id: number
  fullName: string
  businessName?: string | null
  email: string
  phone?: string | null
  specialty?: string | null
  timezone?: string | null
  role: UserRole
  professionalUserId?: number | null
  teamOwnerUserId?: number | null
  clientId?: number | null
  publicSlug?: string | null
  hasAppointmentsModule?: boolean
  hasCatalogModule?: boolean
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
