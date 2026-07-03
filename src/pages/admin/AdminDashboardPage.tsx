import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CalendarRange, Filter, RefreshCw } from 'lucide-react'
import PageCard from '../../components/ui/PageCard'
import SectionHeader from '../../components/ui/SectionHeader'
import { api } from '../../utils/api'
import type {
  AdminAppointmentAnalytics,
  AdminClientAppointmentMetric,
  AdminDashboardSummary,
  AdminPeriodFilterType,
} from '../../types/admin.types'

function getTodayInputValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000)
  return localDate.toISOString().slice(0, 10)
}

function getCurrentMonthInputValue() {
  return getTodayInputValue().slice(0, 7)
}

function formatInputDate(value: string) {
  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value || 'data selecionada'
  }

  return `${day}/${month}/${year}`
}

function formatInputMonth(value: string) {
  const [year, month] = value.split('-')

  if (!year || !month) {
    return value || 'mês selecionado'
  }

  return `${month}/${year}`
}

function getPeriodQuery(type: AdminPeriodFilterType, value: string) {
  return `${type}=${encodeURIComponent(value)}`
}

function getPeriodLabel(type: AdminPeriodFilterType, value: string) {
  return type === 'date' ? formatInputDate(value) : formatInputMonth(value)
}

function getClientMetricRows(analytics: AdminAppointmentAnalytics | null) {
  if (!analytics) return []

  return analytics.clientAppointmentCounts ?? analytics.clients ?? analytics.items ?? []
}

function getMetricCount(metric: AdminClientAppointmentMetric) {
  return Number(metric.appointmentsCount || 0)
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [periodType, setPeriodType] = useState<AdminPeriodFilterType>('month')
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthInputValue)
  const [appointmentAnalytics, setAppointmentAnalytics] =
    useState<AdminAppointmentAnalytics | null>(null)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)
  const [analyticsErrorMessage, setAnalyticsErrorMessage] = useState('')

  const selectedPeriodValue =
    (periodType === 'date' ? selectedDate : selectedMonth) ||
    (periodType === 'date' ? getTodayInputValue() : getCurrentMonthInputValue())
  const selectedPeriodQuery = useMemo(
    () => getPeriodQuery(periodType, selectedPeriodValue),
    [periodType, selectedPeriodValue]
  )
  const selectedPeriodLabel = useMemo(
    () => getPeriodLabel(periodType, selectedPeriodValue),
    [periodType, selectedPeriodValue]
  )
  const selectedPeriodName = periodType === 'date' ? 'dia' : 'mês'

  const clientMetricRows = useMemo(
    () => getClientMetricRows(appointmentAnalytics),
    [appointmentAnalytics]
  )

  const totalAppointmentsForDate = useMemo(() => {
    if (appointmentAnalytics?.totalAppointments !== undefined) {
      return appointmentAnalytics.totalAppointments
    }

    return clientMetricRows.reduce((total, metric) => total + getMetricCount(metric), 0)
  }, [appointmentAnalytics, clientMetricRows])

  const clientsWithAppointments = useMemo(() => {
    if (appointmentAnalytics?.totalClientsWithAppointments !== undefined) {
      return appointmentAnalytics.totalClientsWithAppointments
    }

    return clientMetricRows.length
  }, [appointmentAnalytics, clientMetricRows])

  const averageAppointmentsPerClient = useMemo(() => {
    if (appointmentAnalytics?.averageAppointmentsPerClient !== undefined) {
      return appointmentAnalytics.averageAppointmentsPerClient ?? 0
    }

    if (clientsWithAppointments === 0) return 0

    return totalAppointmentsForDate / clientsWithAppointments
  }, [appointmentAnalytics, clientsWithAppointments, totalAppointmentsForDate])

  useEffect(() => {
    loadDashboardData(selectedPeriodQuery)
  }, [selectedPeriodQuery])

  async function loadDashboardData(periodQuery: string) {
    await Promise.all([
      loadSummary(periodQuery),
      loadAppointmentAnalytics(periodQuery),
    ])
  }

  function handleRefresh() {
    loadDashboardData(selectedPeriodQuery)
  }

  async function loadSummary(periodQuery: string) {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<AdminDashboardSummary>(
        `/api/admin/dashboard?${periodQuery}`
      )
      setSummary(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o painel admin.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function loadAppointmentAnalytics(periodQuery: string) {
    try {
      setIsAnalyticsLoading(true)
      setAnalyticsErrorMessage('')

      const response = await api.get<AdminAppointmentAnalytics>(
        `/api/admin/appointments/client-summary?${periodQuery}`
      )

      setAppointmentAnalytics(response)
    } catch (error) {
      setAppointmentAnalytics(null)
      setAnalyticsErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o resumo de agendamentos.'
      )
    } finally {
      setIsAnalyticsLoading(false)
    }
  }

  if (isLoading && !summary) {
    return <div className="feedback-card">Carregando painel administrativo...</div>
  }

  if (errorMessage && !summary) {
    return <div className="feedback-card error-box">{errorMessage}</div>
  }

  if (!summary) {
    return <div className="feedback-card">Nenhum dado encontrado.</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Painel Administrativo"
        description="Acompanhe o uso e o financeiro geral da plataforma."
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <PageCard className="admin-dashboard-filter-card">
        <div className="admin-dashboard-filter-shell">
          <div className="admin-dashboard-filter-title">
            <span className="admin-dashboard-filter-icon">
              <Filter size={18} />
            </span>
            <div>
              <h3>Filtros do painel</h3>
              <p>Alterne entre visão diária e mensal para revisar os indicadores.</p>
            </div>
          </div>

          <div className="admin-dashboard-filter-controls">
            <div className="admin-period-toggle" role="group" aria-label="Tipo de período">
              <button
                type="button"
                className={`admin-period-toggle-button ${periodType === 'date' ? 'active' : ''}`}
                onClick={() => setPeriodType('date')}
              >
                <CalendarDays size={16} />
                Dia
              </button>

              <button
                type="button"
                className={`admin-period-toggle-button ${periodType === 'month' ? 'active' : ''}`}
                onClick={() => setPeriodType('month')}
              >
                <CalendarRange size={16} />
                Mês
              </button>
            </div>

            <div className="form-field admin-period-input-field">
              <label htmlFor="adminPeriodInput">
                {periodType === 'date' ? 'Data' : 'Mês'}
              </label>
              <input
                id="adminPeriodInput"
                type={periodType}
                className="form-input"
                value={selectedPeriodValue}
                onChange={(event) => {
                  if (periodType === 'date') {
                    setSelectedDate(event.target.value)
                  } else {
                    setSelectedMonth(event.target.value)
                  }
                }}
              />
            </div>

            <div className="admin-selected-period-pill">
              <span>Visualizando</span>
              <strong>{selectedPeriodLabel}</strong>
            </div>

            <button
              type="button"
              className="secondary-button admin-filter-refresh-button"
              onClick={handleRefresh}
              disabled={isLoading || isAnalyticsLoading}
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>
        </div>
      </PageCard>

      <div className="dashboard-highlight-grid">
        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Empresas cadastradas</p>
              <h2 className="dashboard-highlight-number">{summary.totalCompanies}</h2>
            </div>
            <div className="dashboard-highlight-icon">🏢</div>
          </div>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Empresas ativas</p>
              <h2 className="dashboard-highlight-number">{summary.activeCompanies}</h2>
            </div>
            <div className="dashboard-highlight-icon">✅</div>
          </div>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Recebido no {selectedPeriodName}</p>
              <h2 className="dashboard-highlight-number">{summary.receivedThisMonthFormatted}</h2>
            </div>
            <div className="dashboard-highlight-icon">💰</div>
          </div>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Pendente no {selectedPeriodName}</p>
              <h2 className="dashboard-highlight-number">{summary.pendingThisMonthFormatted}</h2>
            </div>
            <div className="dashboard-highlight-icon">📌</div>
          </div>
        </PageCard>
      </div>

      <PageCard className="admin-appointment-metrics-card">
        <div className="admin-metrics-header">
          <div>
            <h3>Agendamentos por cliente</h3>
            <p>Resumo numérico por cliente, sem exibir dados pessoais.</p>
          </div>

          <div className="admin-metrics-period-badge">
            {periodType === 'date' ? 'Dia' : 'Mês'}: {selectedPeriodLabel}
          </div>
        </div>

        <div className="admin-metrics-summary-grid">
          <div className="admin-metrics-summary-item">
            <span>Total no {selectedPeriodName}</span>
            <strong>{totalAppointmentsForDate}</strong>
          </div>

          <div className="admin-metrics-summary-item">
            <span>Clientes atendidos</span>
            <strong>{clientsWithAppointments}</strong>
          </div>

          <div className="admin-metrics-summary-item">
            <span>Média por cliente</span>
            <strong>{averageAppointmentsPerClient.toFixed(1)}</strong>
          </div>
        </div>

        {analyticsErrorMessage ? (
          <div className="feedback-card error-box admin-metrics-feedback">
            {analyticsErrorMessage}
          </div>
        ) : isAnalyticsLoading ? (
          <div className="feedback-card admin-metrics-feedback">
            Carregando resumo de {selectedPeriodLabel}...
          </div>
        ) : clientMetricRows.length === 0 ? (
          <div className="feedback-card admin-metrics-feedback">
            Nenhum agendamento encontrado para {selectedPeriodLabel}.
          </div>
        ) : (
          <div className="admin-client-count-list">
            {clientMetricRows.map((metric, index) => (
              <div
                key={`${metric.clientId ?? metric.clientReference ?? index}`}
                className="admin-client-count-row"
              >
                <span className="admin-client-count-label">Cliente {index + 1}</span>
                <strong className="admin-client-count-number">
                  {getMetricCount(metric)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </PageCard>

      <div className="dashboard-main-grid">
        <PageCard className="dashboard-main-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Indicadores da plataforma</h3>
              <p>Visão consolidada do mês atual.</p>
            </div>
          </div>

          <div className="finance-indicator-stack">
            <div className="finance-indicator-box">
              <span className="muted-text">Novas empresas no {selectedPeriodName}</span>
              <strong>{summary.newCompaniesThisMonth}</strong>
            </div>

            <div className="finance-indicator-box">
              <span className="muted-text">Agendamentos do {selectedPeriodName}</span>
              <strong>{summary.totalAppointmentsThisMonth}</strong>
            </div>

            <div className="finance-indicator-box">
              <span className="muted-text">Clientes na base</span>
              <strong>{summary.totalClients}</strong>
            </div>

            <div className="finance-indicator-box">
              <span className="muted-text">Empresas bloqueadas</span>
              <strong>{summary.blockedCompanies}</strong>
            </div>
          </div>
        </PageCard>

        <PageCard className="dashboard-side-card">
          <div className="dashboard-section-header">
            <div>
              <h3>Empresas recentes</h3>
              <p>Últimas empresas cadastradas.</p>
            </div>
          </div>

          <div className="dashboard-clients-list">
            {summary.recentCompanies.length === 0 ? (
              <div className="empty-state">Nenhuma empresa encontrada.</div>
            ) : (
              summary.recentCompanies.map((company) => (
                <div key={company.id} className="dashboard-client-item">
                  <div>
                    <strong>{company.name}</strong>
                    <p className="muted-text">{company.ownerName}</p>
                  </div>
                  <span className="soft-pill">{company.status}</span>
                </div>
              ))
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}
