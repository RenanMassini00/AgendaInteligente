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
    <div className="page-stack dashboard-clean-page">
      <SectionHeader
        title="Resumo do dia"
        description="Visualize rapidamente seus agendamentos e clientes."
        action={
          <div className="dashboard-top-actions">
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

            <Link to={ROUTE_PATHS.createClient} className="secondary-button">
              Novo cliente
            </Link>
          </div>
        }
      />

      <div className="dashboard-highlight-grid">
        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">{appointmentCardLabels[period]}</p>
              <h2 className="dashboard-highlight-number">{data.appointmentsToday}</h2>
            </div>

            <div className="dashboard-highlight-icon">📅</div>
          </div>

          <p className="dashboard-highlight-text">
            Acompanhe sua carga de atendimentos no período selecionado.
          </p>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Clientes ativos</p>
              <h2 className="dashboard-highlight-number">{data.clients}</h2>
            </div>

            <div className="dashboard-highlight-icon">👤</div>
          </div>

          <p className="dashboard-highlight-text">
            Base de clientes cadastrados e disponíveis no sistema.
          </p>
        </PageCard>
      </div>

      <div className="dashboard-main-grid">
        <PageCard className="dashboard-main-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Próximos agendamentos</h3>
              <p>Seu foco principal do período.</p>
            </div>
          </div>

          <div className="dashboard-appointments-list">
            {data.upcomingAppointments.length === 0 ? (
              <div className="empty-state">Nenhum agendamento encontrado.</div>
            ) : (
              data.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="dashboard-appointment-item">
                  <div className="dashboard-appointment-left">
                    <div className="dashboard-appointment-main">
                      <strong>{appointment.clientName}</strong>
                      <StatusBadge status={appointment.status} />
                    </div>

                    <p className="muted-text">{appointment.serviceName}</p>
                  </div>

                  <div className="dashboard-appointment-right">
                    <span className="soft-pill">{appointment.date}</span>
                    <span className="soft-pill">{appointment.time}</span>
                    <span className="soft-pill">{appointment.priceFormatted}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </PageCard>

        <PageCard className="dashboard-side-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Clientes recentes</h3>
              <p>Últimos clientes cadastrados.</p>
            </div>
          </div>

          <div className="dashboard-clients-list">
            {data.recentClients.length === 0 ? (
              <div className="empty-state">Nenhum cliente encontrado.</div>
            ) : (
              data.recentClients.map((client) => (
                <div key={client.id} className="dashboard-client-item">
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
      </div>

      <div className="dashboard-footer-grid">
        <PageCard className="dashboard-compact-card">
          <div className="dashboard-compact-header">
            <div>
              <h3>Receita do período</h3>
              <p>Valor acumulado no filtro atual.</p>
            </div>
          </div>

          <div className="dashboard-compact-metric">
            {data.expectedRevenueFormatted}
          </div>
        </PageCard>

        <PageCard className="dashboard-compact-card">
          <div className="dashboard-compact-header">
            <div>
              <h3>Serviços mais usados</h3>
              <p>Resumo rápido dos serviços.</p>
            </div>
          </div>

          <div className="dashboard-mini-list">
            {data.topServices.length === 0 ? (
              <div className="empty-state">Nenhum serviço encontrado.</div>
            ) : (
              data.topServices.slice(0, 3).map((service) => (
                <div key={service.id} className="dashboard-mini-list-item">
                  <div>
                    <strong>{service.name}</strong>
                    <p className="muted-text">Duração: {service.duration}</p>
                  </div>

                  <span className="soft-pill">{service.priceFormatted}</span>
                </div>
              ))
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}