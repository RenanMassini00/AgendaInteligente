import type { AppointmentStatus } from '../../types/appointment.types'

type StatusBadgeProps = {
  status: AppointmentStatus
}

const labels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  pending_payment: 'Aguardando pagamento',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'No-show',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status}`}>{labels[status]}</span>
}
