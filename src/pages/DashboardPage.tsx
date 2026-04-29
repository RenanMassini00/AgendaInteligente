import { appointmentsMock } from '../mocks/appointmentsMock'
import { clientsMock } from '../mocks/clientsMock'
import { servicesMock } from '../mocks/servicesMock'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { formatCurrency } from '../utils/currency'

export default function DashboardPage() {
  const todayAppointments = appointmentsMock.filter((item) => item.date === '2026-04-29')
  const revenue = todayAppointments.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="page-stack">
      <SectionHeader
        title="Resumo do dia"
        description="Acompanhe sua agenda, clientes e serviços em um só lugar."
        action={<button className="primary-button">Novo agendamento</button>}
      />

      <div className="stats-grid">
        <PageCard>
          <p className="muted-text">Agendamentos hoje</p>
          <h3 className="stat-number">{todayAppointments.length}</h3>
        </PageCard>
        <PageCard>
          <p className="muted-text">Clientes</p>
          <h3 className="stat-number">{clientsMock.length}</h3>
        </PageCard>
        <PageCard>
          <p className="muted-text">Serviços</p>
          <h3 className="stat-number">{servicesMock.length}</h3>
        </PageCard>
        <PageCard>
          <p className="muted-text">Receita prevista</p>
          <h3 className="stat-number">{formatCurrency(revenue)}</h3>
        </PageCard>
      </div>

      <div className="dashboard-grid">
        <PageCard>
          <div className="card-heading">
            <div>
              <h3>Próximos agendamentos</h3>
              <p>Sua agenda para hoje e amanhã.</p>
            </div>
          </div>

          <div className="list-stack">
            {appointmentsMock.map((appointment) => (
              <div key={appointment.id} className="list-item split-row">
                <div>
                  <div className="inline-row wrap-gap">
                    <strong>{appointment.clientName}</strong>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <p className="muted-text">{appointment.serviceName}</p>
                </div>

                <div className="pill-group">
                  <span className="soft-pill">{appointment.date}</span>
                  <span className="soft-pill">{appointment.time}</span>
                  <span className="soft-pill">{formatCurrency(appointment.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </PageCard>

        <div className="page-stack">
          <PageCard>
            <div className="card-heading">
              <div>
                <h3>Clientes recentes</h3>
                <p>Contatos ativos do MVP.</p>
              </div>
            </div>

            <div className="list-stack">
              {clientsMock.map((client) => (
                <div key={client.id} className="list-item split-row light">
                  <div>
                    <strong>{client.name}</strong>
                    <p className="muted-text">{client.phone}</p>
                  </div>
                  <button className="secondary-button">Ver</button>
                </div>
              ))}
            </div>
          </PageCard>

          <PageCard>
            <div className="card-heading">
              <div>
                <h3>Serviços mais usados</h3>
                <p>Base inicial de serviços do projeto.</p>
              </div>
            </div>

            <div className="list-stack">
              {servicesMock.map((service) => (
                <div key={service.id} className="list-item">
                  <div className="split-row">
                    <div>
                      <strong>{service.name}</strong>
                      <p className="muted-text">Duração: {service.duration}</p>
                    </div>
                    <span className="soft-pill">{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  )
}
