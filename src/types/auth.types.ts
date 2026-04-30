export type AuthUser = {
  id: number
  fullName: string
  businessName?: string | null
  email: string
  phone?: string | null
  specialty?: string | null
  timezone: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
