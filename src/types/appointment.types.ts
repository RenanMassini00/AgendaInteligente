export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

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
  price: number
  priceFormatted: string
  notes?: string | null
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
