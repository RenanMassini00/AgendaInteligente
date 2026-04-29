export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

export type Appointment = {
  id: string
  clientName: string
  serviceName: string
  date: string
  time: string
  status: AppointmentStatus
  price: number
}
