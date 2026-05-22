import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock3, Plus, Pencil, Scissors, Tag, Trash2 } from 'lucide-react'
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
    <div className="page-stack management-page">
      <SectionHeader
        title="Serviços"
        description="Organize os serviços, preços e duração que aparecem para agendamento."
        action={
          <Link to={ROUTE_PATHS.createService} className="primary-button">
            <Plus size={18} />
            Novo serviço
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="cards-grid three-cols compact-entity-grid">
        {isLoading ? (
          <div className="feedback-card">Carregando serviços...</div>
        ) : services.length === 0 ? (
          <div className="feedback-card">Nenhum serviço encontrado.</div>
        ) : (
          services.map((service) => (
            <PageCard key={service.id} className="compact-entity-card service-entity-card">
              <div className="entity-card">
                <div className="entity-card-head">
                  <div className="entity-icon service-icon">
                    <Scissors size={18} />
                  </div>

                  <div className="entity-card-title">
                    <h3>{service.name}</h3>
                    <span>{service.description || 'Sem descrição cadastrada'}</span>
                  </div>
                </div>

                <div className="entity-card-meta-list entity-card-meta-list--inline">
                  <div className="entity-card-meta-item">
                    <Clock3 size={16} />
                    <span>{service.duration}</span>
                  </div>

                  <div className="entity-card-meta-item">
                    <Tag size={16} />
                    <strong>{service.priceFormatted}</strong>
                  </div>
                </div>

                <div className="entity-card-actions">
                  <button
                    type="button"
                    className="secondary-button small-button"
                    onClick={() => handleEditService(service.id)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="danger-button small-button"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 size={16} />
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
