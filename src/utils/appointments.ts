const cancelledStatuses = new Set(['cancelled', 'canceled', 'cancelado'])

export function isCancelledAppointmentStatus(status?: string | null) {
  return cancelledStatuses.has((status || '').trim().toLowerCase())
}

export function filterVisibleAppointments<T extends { status?: string | null }>(
  appointments: T[]
) {
  return appointments.filter((appointment) => !isCancelledAppointmentStatus(appointment.status))
}
