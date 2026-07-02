import type { AccentColor, ThemeMode } from './settings.types'

export type PublicBookingService = {
  id: number
  name: string
  description?: string | null
  durationMinutes: number
  durationFormatted: string
  price: number
  priceFormatted: string
}

export type PublicProfessional = {
  name?: string
  displayName: string
  subtitle: string
  slug: string
  theme?: ThemeMode | null
  accentColor?: AccentColor | null
  companyLogoUrl?: string | null
  services: PublicBookingService[]
}

export type PublicAvailableSlots = {
  date: string
  serviceId: number
  slots: string[]
}

export type PublicBookingResponse = {
  appointmentId: number
  clientName: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  professionalName: string
  businessName?: string | null
  clientEmailSent: boolean
  professionalEmailSent: boolean
  calendarCreated: boolean
  message: string
}
