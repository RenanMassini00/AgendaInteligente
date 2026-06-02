import { useEffect, useState } from 'react'
import PageCard from '../../components/ui/PageCard'
import SectionHeader from '../../components/ui/SectionHeader'
import { api } from '../../utils/api'
import type { AdminDashboardSummary } from '../../types/admin.types'

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadSummary()
  }, [])

  async function loadSummary() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<AdminDashboardSummary>('/api/admin/dashboard')
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

  if (isLoading) {
    return <div className="feedback-card">Carregando painel administrativo...</div>
  }

  if (errorMessage) {
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
              <p className="dashboard-highlight-label">Recebido no mês</p>
              <h2 className="dashboard-highlight-number">{summary.receivedThisMonthFormatted}</h2>
            </div>
            <div className="dashboard-highlight-icon">💰</div>
          </div>
        </PageCard>

        <PageCard className="dashboard-highlight-card">
          <div className="dashboard-highlight-head">
            <div>
              <p className="dashboard-highlight-label">Pendente no mês</p>
              <h2 className="dashboard-highlight-number">{summary.pendingThisMonthFormatted}</h2>
            </div>
            <div className="dashboard-highlight-icon">📌</div>
          </div>
        </PageCard>
      </div>

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
              <span className="muted-text">Novas empresas no mês</span>
              <strong>{summary.newCompaniesThisMonth}</strong>
            </div>

            <div className="finance-indicator-box">
              <span className="muted-text">Agendamentos do mês</span>
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