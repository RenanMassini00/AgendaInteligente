export type PublicService = {
  id: number
  name: string
  description?: string | null
  durationMinutes: number
  duration: string
  price: number
  priceFormatted: string
}

export type PublicProfessional = {
  displayName: string
  subtitle: string
  publicSlug: string
  services: PublicService[]
}

export type PublicAvailableSlots = {
  date: string
  serviceId: number
  slots: string[]
}

export type PublicBookingResponse = {
  appointmentId: number
  fullName: string
  phone: string
  serviceName: string
  date: string
  time: string
  status: string
  message: string
}