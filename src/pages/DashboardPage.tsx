import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { DashboardSummary } from '../types/dashboard.types'

type DashboardPeriod = 'day' | 'month' | '3months' | '6months'

const periodLabels: Record<DashboardPeriod, string> = {
  day: 'Hoje',
  month: 'Mensal',
  '3months': '3 meses',
  '6months': '6 meses',
}

const appointmentCardLabels: Record<DashboardPeriod, string> = {
  day: 'Agendamentos hoje',
  month: 'Agendamentos no mês',
  '3months': 'Agendamentos em 3 meses',
  '6months': 'Agendamentos em 6 meses',
}

function getCurrentMonthValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [period, setPeriod] = useState<DashboardPeriod>('day')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue())

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setIsLoading(true)

        let url = `/api/dashboard/summary?userId=${getCurrentUserId()}&period=${period}`

        if (period !== 'day') {
          url += `&month=${selectedMonth}`
        }

        const response = await api.get<DashboardSummary>(url)

        if (isMounted) {
          setData(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o dashboard.'
          )
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
  }, [period, selectedMonth])

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
          <div className="dashboard-actions">
            <select
              className="dashboard-filter-select"
              value={period}
              onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
            >
              <option value="day">{periodLabels.day}</option>
              <option value="month">{periodLabels.month}</option>
              <option value="3months">{periodLabels['3months']}</option>
              <option value="6months">{periodLabels['6months']}</option>
            </select>

            {period !== 'day' && (
              <input
                type="month"
                className="dashboard-filter-select"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            )}

            <Link to={ROUTE_PATHS.createAppointment} className="primary-button">
              Novo agendamento
            </Link>
          </div>
        }
      />

      <div className="stats-grid">
        <PageCard>
          <p className="muted-text">{appointmentCardLabels[period]}</p>
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
          <p className="muted-text">Receita do período</p>
          <h3 className="stat-number">{data.expectedRevenueFormatted}</h3>
        </PageCard>
      </div>

      <div className="dashboard-grid">
        <PageCard>
          <div className="card-heading">
            <div>
              <h3>Próximos agendamentos</h3>
              <p>Lista baseada no período selecionado.</p>
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
                <p>Base integrada ao período selecionado.</p>
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