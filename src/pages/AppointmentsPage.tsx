import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { appointmentsMock } from '../mocks/appointmentsMock'
import { formatCurrency } from '../utils/currency'

export default function AppointmentsPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Agendamentos"
        description="Visualize e gerencie os compromissos do profissional."
        action={<button className="primary-button">Novo</button>}
      />

      <PageCard className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsMock.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.clientName}</td>
                  <td>{appointment.serviceName}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td><StatusBadge status={appointment.status} /></td>
                  <td>{formatCurrency(appointment.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  )
}
