export type PublicProfessional = {
  id: number
  fullName: string
  businessName?: string | null
  email: string
  specialty?: string | null
  publicSlug?: string | null
}

export type AvailableSlot = {
  time: string
  endTime: string
}
