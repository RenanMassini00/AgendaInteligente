import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Service } from '../types/service.types'

export default function ServicesPage() {
  const navigate = useNavigate()

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      setIsLoading(true)
      const response = await api.get<Service[]>(`/api/services?userId=${getCurrentUserId()}`)
      setServices(response)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível carregar os serviços.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteService(id: number) {
    const confirmed = window.confirm('Deseja realmente excluir este serviço?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/services/${id}`)
      setSuccessMessage('Serviço excluído com sucesso.')
      await loadServices()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível excluir o serviço.'
      )
    }
  }

  function handleEditService(id: number) {
    navigate(`/services/${id}/edit`)
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Serviços"
        description="Cadastre os serviços que poderão ser agendados."
        action={
          <Link to={ROUTE_PATHS.createService} className="primary-button">
            Novo serviço
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="cards-grid two-cols">
        {isLoading ? (
          <div className="feedback-card">Carregando serviços...</div>
        ) : services.length === 0 ? (
          <div className="feedback-card">Nenhum serviço encontrado.</div>
        ) : (
          services.map((service) => (
            <PageCard key={service.id}>
              <div className="entity-card">
                <div className="card-stack">
                  <div>
                    <h3>{service.name}</h3>
                    <p className="muted-text">Duração: {service.duration}</p>
                    <p className="muted-text small-text">
                      {service.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>

                  <div className="soft-pill">{service.priceFormatted}</div>
                </div>

                <div className="entity-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleEditService(service.id)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}