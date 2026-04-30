import type { Appointment } from './appointment.types'
import type { Client } from './client.types'
import type { ServiceItem } from './service.types'

export type DashboardSummary = {
  appointmentsToday: number
  clients: number
  services: number
  expectedRevenue: number
  expectedRevenueFormatted: string
  upcomingAppointments: Appointment[]
  recentClients: Client[]
  topServices: ServiceItem[]
}
