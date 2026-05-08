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
  status: string
  priceAtBooking: number
  priceFormatted: string
  notes?: string | null
}

export type AppointmentFormPayload = {
  userId: number
  clientId: number
  serviceId: number
  appointmentDate: string
  startTime: string
  notes?: string | null
}