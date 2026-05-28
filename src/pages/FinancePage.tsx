import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'
import { filterVisibleAppointments, isCancelledAppointmentStatus } from '../utils/appointments'
import type { FinanceSummary } from '../types/finance.types'

function getCurrentMonthValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function getStatusTheme(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'concluded':
    case 'done':
    case 'concluído':
      return 'success'
    case 'confirmed':
    case 'confirmado':
      return 'info'
    case 'scheduled':
    case 'agendado':
      return 'warning'
    case 'cancelled':
    case 'canceled':
    case 'cancelado':
      return 'danger'
    default:
      return 'neutral'
  }
}

function canComplete(status: string) {
  const normalized = (status || '').toLowerCase()
  return !['completed', 'concluded', 'done', 'concluído'].includes(normalized) &&
    !isCancelledAppointmentStatus(status)
}

function canDelete(status: string) {
  const normalized = (status || '').toLowerCase()
  return !['completed', 'concluded', 'done', 'concluído'].includes(normalized)
}

export default function FinancePage() {
  const navigate = useNavigate()

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue())
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadFinance()
  }, [selectedMonth])

  async function loadFinance() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<FinanceSummary>(
        `/api/finance/summary?userId=${getCurrentUserId()}&month=${selectedMonth}`
      )

      setSummary(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o financeiro.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCompleteAppointment(id: number) {
    const confirmed = window.confirm('Deseja marcar este agendamento como concluído?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.patch(`/api/appointments/${id}/status`, {
        status: 'completed',
      } as never)

      setSuccessMessage('Agendamento concluído com sucesso.')
      await loadFinance()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o agendamento.'
      )
    }
  }

  async function handleDeleteAppointment(id: number) {
    const confirmed = window.confirm('Deseja realmente excluir este agendamento?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/appointments/${id}`)
      setSuccessMessage('Agendamento excluído com sucesso.')
      await loadFinance()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o agendamento.'
      )
    }
  }

  function handleEditAppointment(id: number) {
    navigate(`/appointments/${id}/edit`)
  }

  const maxDailyAmount = useMemo(() => {
    if (!summary?.dailyTotals?.length) return 0
    return Math.max(...summary.dailyTotals.map((item) => item.amount))
  }, [summary])

  const visibleAppointments = useMemo(() => {
    return summary ? filterVisibleAppointments(summary.appointments) : []
  }, [summary])

  const visibleStatusTotals = useMemo(() => {
    return summary
      ? summary.statusTotals.filter(
          (item) =>
            !isCancelledAppointmentStatus(item.status) &&
            !isCancelledAppointmentStatus(item.label)
        )
      : []
  }, [summary])

  const visibleCompletedAppointmentsCount = useMemo(() => {
    return visibleAppointments.filter((item) => {
      const normalized = (item.status || '').toLowerCase()
      return ['completed', 'concluded', 'done', 'concluído'].includes(normalized)
    }).length
  }, [visibleAppointments])

  return (
    <div className="page-stack finance-page">
      <SectionHeader
        title="Financeiro"
        description="Acompanhe receita, previsão, indicadores e composição do mês."
        action={
          <div className="dashboard-top-actions">
            <input
              type="month"
              className="dashboard-filter-select"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      {isLoading ? (
        <div className="feedback-card">Carregando financeiro...</div>
      ) : !summary ? (
        <div className="feedback-card">Nenhum dado financeiro encontrado.</div>
      ) : (
        <>
          <div className="finance-hero-card">
            <div className="finance-hero-content">
              <div>
                <span className="finance-kicker">Visão financeira</span>
                <h2>{summary.monthLabel}</h2>
                <p>
                  Tenha uma leitura rápida do valor recebido, previsão do mês,
                  ticket médio e melhor desempenho diário.
                </p>
              </div>

              <div className="finance-hero-pill-group">
                <div className="finance-hero-pill">
                  <span>Recebido</span>
                  <strong>{summary.receivedTotalFormatted}</strong>
                </div>

                <div className="finance-hero-pill">
                  <span>Previsto</span>
                  <strong>{summary.forecastTotalFormatted}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="finance-executive-grid">
            <PageCard className="finance-executive-card">
              <span className="finance-card-label">Recebido no mês</span>
              <strong className="finance-card-value">{summary.receivedTotalFormatted}</strong>
              <p className="finance-card-caption">
                Total efetivamente recebido em atendimentos concluídos.
              </p>
            </PageCard>

            <PageCard className="finance-executive-card">
              <span className="finance-card-label">Previsto no mês</span>
              <strong className="finance-card-value">{summary.forecastTotalFormatted}</strong>
              <p className="finance-card-caption">
                Soma dos agendamentos ainda válidos no mês selecionado.
              </p>
            </PageCard>

            <PageCard className="finance-executive-card">
              <span className="finance-card-label">Ticket médio</span>
              <strong className="finance-card-value">{summary.averageTicketFormatted}</strong>
              <p className="finance-card-caption">
                Média por atendimento concluído.
              </p>
            </PageCard>

            <PageCard className="finance-executive-card">
              <span className="finance-card-label">Taxa de conclusão</span>
              <strong className="finance-card-value">{summary.completionRateFormatted}</strong>
              <p className="finance-card-caption">
                {visibleCompletedAppointmentsCount} concluído(s) de {visibleAppointments.length}.
              </p>
            </PageCard>
          </div>

          <div className="finance-main-grid">
            <PageCard className="finance-chart-card">
              <div className="dashboard-section-header">
                <div>
                  <h3>Receita por dia</h3>
                  <p>Distribuição do valor recebido ao longo do mês.</p>
                </div>
              </div>

              {summary.dailyTotals.length === 0 ? (
                <div className="empty-state">Nenhum recebimento no mês selecionado.</div>
              ) : (
                <div className="finance-bar-chart">
                  {summary.dailyTotals.map((item) => {
                    const percent =
                      maxDailyAmount > 0 ? Math.max((item.amount / maxDailyAmount) * 100, 8) : 0

                    return (
                      <div key={item.date} className="finance-bar-row">
                        <div className="finance-bar-labels">
                          <strong>{item.date}</strong>
                          <span>{item.appointmentsCount} atendimento(s)</span>
                        </div>

                        <div className="finance-bar-track">
                          <div
                            className="finance-bar-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="finance-bar-value">{item.amountFormatted}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </PageCard>

            <PageCard className="finance-side-card">
              <div className="dashboard-section-header">
                <div>
                  <h3>Indicadores</h3>
                  <p>Resumo de performance do mês.</p>
                </div>
              </div>

              <div className="finance-indicator-stack">
                <div className="finance-indicator-box">
                  <span className="muted-text">Melhor dia</span>
                  <strong>{summary.bestDayAmountFormatted}</strong>
                  <small className="muted-text">
                    {summary.bestDayDate || 'Nenhum dia com recebimento'}
                  </small>
                </div>

                <div className="finance-indicator-box">
                  <span className="muted-text">Serviço destaque</span>
                  <strong>{summary.topServiceName || 'Sem destaque'}</strong>
                  <small className="muted-text">Maior valor acumulado no mês</small>
                </div>

                <div className="finance-indicator-box">
                  <span className="muted-text">Atendimentos do mês</span>
                  <strong>{visibleAppointments.length}</strong>
                  <small className="muted-text">
                    Visão total de atendimentos lançados.
                  </small>
                </div>
              </div>
            </PageCard>
          </div>

          <div className="finance-main-grid">
            <PageCard className="finance-main-card">
              <div className="dashboard-section-header">
                <div>
                  <h3>Distribuição por status</h3>
                  <p>Veja o impacto financeiro por etapa do atendimento.</p>
                </div>
              </div>

              <div className="finance-status-grid">
                {visibleStatusTotals.length === 0 ? (
                  <div className="empty-state">Nenhum status encontrado.</div>
                ) : (
                  visibleStatusTotals.map((item) => (
                    <div
                      key={`${item.status}-${item.label}`}
                      className={`finance-status-card ${getStatusTheme(item.status)}`}
                    >
                      <div className="finance-status-top">
                        <strong>{item.label}</strong>
                        <span>{item.count} item(ns)</span>
                      </div>
                      <div className="finance-status-value">{item.amountFormatted}</div>
                    </div>
                  ))
                )}
              </div>
            </PageCard>

            <PageCard className="finance-side-card">
              <div className="dashboard-section-header">
                <div>
                  <h3>Serviços mais rentáveis</h3>
                  <p>Ranking por valor acumulado.</p>
                </div>
              </div>

              <div className="finance-service-ranking">
                {summary.serviceTotals.length === 0 ? (
                  <div className="empty-state">Nenhum serviço encontrado.</div>
                ) : (
                  summary.serviceTotals.map((item, index) => (
                    <div key={`${item.serviceName}-${index}`} className="finance-service-item">
                      <div>
                        <strong>{item.serviceName}</strong>
                        <p className="muted-text">{item.count} atendimento(s)</p>
                      </div>

                      <span className="soft-pill finance-money-pill">
                        {item.amountFormatted}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </PageCard>
          </div>

          <PageCard className="dashboard-main-card">
            <div className="dashboard-section-header">
              <div>
                <h3>Lançamentos do mês</h3>
                <p>Atendimentos que compõem os números do período.</p>
              </div>
            </div>

            <div className="dashboard-appointments-list">
              {visibleAppointments.length === 0 ? (
                <div className="empty-state">Nenhum lançamento encontrado.</div>
              ) : (
                visibleAppointments.map((item) => (
                  <div key={item.id} className="dashboard-appointment-item finance-appointment-item">
                    <div className="dashboard-appointment-left">
                      <div className="dashboard-appointment-main">
                        <strong>{item.clientName}</strong>
                        <span className={`finance-inline-status ${getStatusTheme(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="muted-text">{item.serviceName}</p>
                    </div>

                    <div className="dashboard-appointment-right">
                      <span className="soft-pill">{item.date}</span>
                      <span className="soft-pill">{item.time}</span>
                      <span className="soft-pill">{item.amountFormatted}</span>
                    </div>

                    <div className="finance-appointment-actions">
                      {canComplete(item.status) ? (
                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={() => handleCompleteAppointment(item.id)}
                        >
                          Concluir
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => handleEditAppointment(item.id)}
                      >
                        Editar
                      </button>

                      {canDelete(item.status) ? (
                        <button
                          type="button"
                          className="danger-button small-button"
                          onClick={() => handleDeleteAppointment(item.id)}
                        >
                          Excluir
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PageCard>
        </>
      )}
    </div>
  )
}
