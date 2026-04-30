import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { DashboardSummary } from '../types/dashboard.types'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setIsLoading(true)
        const response = await api.get<DashboardSummary>(`/api/dashboard/summary?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setData(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="feedback-card">Carregando dashboard...</div>
  }

  if (errorMessage) {
    return <div className="feedback-card error-box">{errorMessage}</div>
  }

  if (!data) {
    return <div className="feedback-card">Nenhum dado encontrado.</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Resumo do dia"
        description="Acompanhe sua agenda, clientes e serviços em um só lugar."
        action={
          <Link to={ROUTE_PATHS.createAppointment} className="primary-button">
            Novo agendamento
          </Link>
        }
      />

      <div className="stats-grid">
        <PageCard>
          <p className="muted-text">Agendamentos hoje</p>
          <h3 className="stat-number">{data.appointmentsToday}</h3>
        </PageCard>
        <PageCard>
          <p className="muted-text">Clientes</p>
          <h3 className="stat-number">{data.clients}</h3>
        </PageCard>
        <PageCard>
          <p className="muted-text">Serviços</p>
          <h3 className="stat-number">{data.services}</h3>
        </PageCard>
        <PageCard>
          <p className="muted-text">Receita prevista</p>
          <h3 className="stat-number">{data.expectedRevenueFormatted}</h3>
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
            {data.upcomingAppointments.length === 0 ? (
              <div className="empty-state">Nenhum agendamento encontrado.</div>
            ) : (
              data.upcomingAppointments.map((appointment) => (
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
                    <span className="soft-pill">{appointment.priceFormatted}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </PageCard>

        <div className="page-stack">
          <PageCard>
            <div className="card-heading">
              <div>
                <h3>Clientes recentes</h3>
                <p>Contatos ativos do sistema.</p>
              </div>
            </div>

            <div className="list-stack">
              {data.recentClients.length === 0 ? (
                <div className="empty-state">Nenhum cliente encontrado.</div>
              ) : (
                data.recentClients.map((client) => (
                  <div key={client.id} className="list-item split-row light">
                    <div>
                      <strong>{client.name}</strong>
                      <p className="muted-text">{client.phone}</p>
                    </div>
                    <span className="secondary-button small-button">Ativo</span>
                  </div>
                ))
              )}
            </div>
          </PageCard>

          <PageCard>
            <div className="card-heading">
              <div>
                <h3>Serviços mais usados</h3>
                <p>Base inicial integrada com a API.</p>
              </div>
            </div>

            <div className="list-stack">
              {data.topServices.length === 0 ? (
                <div className="empty-state">Nenhum serviço encontrado.</div>
              ) : (
                data.topServices.map((service) => (
                  <div key={service.id} className="list-item">
                    <div className="split-row">
                      <div>
                        <strong>{service.name}</strong>
                        <p className="muted-text">Duração: {service.duration}</p>
                      </div>
                      <span className="soft-pill">{service.priceFormatted}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  )
}
