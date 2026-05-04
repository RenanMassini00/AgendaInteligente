export type UserRole = 'professional' | 'client'

export type AuthUser = {
  id: number
  fullName: string
  businessName?: string | null
  email: string
  phone?: string | null
  specialty?: string | null
  timezone: string
  role: UserRole
  professionalUserId?: number | null
  clientId?: number | null
  publicSlug?: string | null
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
