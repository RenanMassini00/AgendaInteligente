export type ProfessionalTeamEmployee = {
  id: number
  userId: number
  fullName: string
  email?: string | null
  phone?: string | null
  isActive: boolean
}

export type ProfessionalTeamEmployeeInput = {
  fullName: string
  email: string
  phone: string
  isActive: boolean
}
