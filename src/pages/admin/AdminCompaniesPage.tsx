import { useEffect, useState } from 'react'
import PageCard from '../../components/ui/PageCard'
import SectionHeader from '../../components/ui/SectionHeader'
import { api } from '../../utils/api'
import type { AdminCompany } from '../../types/admin.types'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<AdminCompany[]>('/api/admin/companies')
      setCompanies(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as empresas.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Empresas"
        description="Gerencie as empresas que utilizam a plataforma."
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <div className="cards-grid two-cols">
        {isLoading ? (
          <div className="feedback-card">Carregando empresas...</div>
        ) : companies.length === 0 ? (
          <div className="feedback-card">Nenhuma empresa encontrada.</div>
        ) : (
          companies.map((company) => (
            <PageCard key={company.id}>
              <div className="entity-card">
                <div className="card-stack">
                  <div>
                    <h3>{company.name}</h3>
                    <p className="muted-text">{company.ownerName}</p>
                    <p className="muted-text small-text">{company.email}</p>
                    <p className="muted-text small-text">Status: {company.status}</p>
                  </div>

                  <div className="soft-pill">{company.monthlyFeeFormatted}</div>
                </div>

                <div className="finance-indicator-stack">
                  <div className="finance-indicator-box">
                    <span className="muted-text">Profissionais</span>
                    <strong>{company.professionalsCount}</strong>
                  </div>

                  <div className="finance-indicator-box">
                    <span className="muted-text">Clientes</span>
                    <strong>{company.clientsCount}</strong>
                  </div>

                  <div className="finance-indicator-box">
                    <span className="muted-text">Serviços</span>
                    <strong>{company.servicesCount}</strong>
                  </div>

                  <div className="finance-indicator-box">
                    <span className="muted-text">Agendamentos</span>
                    <strong>{company.appointmentsCount}</strong>
                  </div>
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}