export type AppointmentStatus =
  | 'scheduled'
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type Appointment = {
  id: number
  clientId: number
  serviceId: number
  clientName: string
  serviceName: string
  date: string
  time: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  priceAtBooking: number
  priceFormatted: string
  notes?: string | null
  paymentStatus?: string | null
  depositAmount?: number | null
  pixQrCode?: string | null
  pixQrCodeBase64?: string | null
  paymentReference?: string | null
  paymentExpiresAt?: string | null
}

export type AppointmentCreateRequest = {
  userId: number
  clientId: number
  serviceId: number
  date: string
  time: string
  status: AppointmentStatus
  notes?: string
}

export type AppointmentFormPayload = {
  userId: number
  clientId: number
  serviceId: number
  appointmentDate: string
  startTime: string
  notes?: string | null
}
