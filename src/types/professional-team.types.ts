export type ProfessionalTeamEmployee = {
  id: number
  userId: number
  fullName: string
  email?: string | null
  phone?: string | null
  specialty?: string | null
  timezone?: string | null
  isActive: boolean
}

export type ProfessionalTeamEmployeeInput = {
  fullName: string
  email: string
  password?: string
  phone?: string | null
  specialty?: string | null
  timezone?: string | null
}
