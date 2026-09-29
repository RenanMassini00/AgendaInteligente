import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock3, Plus, Pencil, Scissors, Tag, Trash2 } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentRole, getCurrentUserId } from '../utils/auth'
import { getProfessionalTeamEmployees } from '../utils/professionalTeam'
import { api } from '../utils/api'
import type { Service } from '../types/service.types'
import type { ProfessionalTeamEmployee } from '../types/professional-team.types'

export default function ServicesPage() {
  const navigate = useNavigate()
  const ownerUserId = getCurrentUserId()
  const isEmployee = getCurrentRole() === 'employee'

  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<ProfessionalTeamEmployee[]>([])
  const [selectedUserId, setSelectedUserId] = useState(ownerUserId)
  const [isTeamLoaded, setIsTeamLoaded] = useState(false)
  const [teamError, setTeamError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    async function loadTeam() {
      if (isEmployee) {
        setSelectedUserId(ownerUserId)
        setIsTeamLoaded(true)
        return
      }

      try {
        const response = await getProfessionalTeamEmployees()
        if (!isMounted) return
        const activeEmployees = response.filter((employee) => employee.isActive)
        setEmployees(activeEmployees)
        if (activeEmployees.length > 0) {
          setSelectedUserId(activeEmployees[0].userId)
        }
      } catch (error) {
        if (isMounted) {
          setTeamError(error instanceof Error ? error.message : 'Não foi possível carregar a equipe.')
        }
      } finally {
        if (isMounted) setIsTeamLoaded(true)
      }
    }
    void loadTeam()
    return () => {
      isMounted = false
    }
  }, [isEmployee, ownerUserId])

  useEffect(() => {
    if (isTeamLoaded) void loadServices(selectedUserId)
  }, [isTeamLoaded, selectedUserId])

  async function loadServices(userId = selectedUserId) {
    try {
      setIsLoading(true)
      const response = await api.get<Service[]>(
        isEmployee ? '/api/services' : `/api/services?userId=${userId}`
      )
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

      await api.delete(`/api/services/${id}?userId=${selectedUserId}`)
      setSuccessMessage('Serviço excluído com sucesso.')
      await loadServices(selectedUserId)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível excluir o serviço.'
      )
    }
  }

  function handleEditService(id: number) {
    navigate(`/services/${id}/edit?userId=${selectedUserId}`)
  }

  return (
    <div className="page-stack management-page services-market-page">
      <SectionHeader
        title="Serviços"
        description="Organize os serviços de cada profissional, com preços e duração para agendamento."
        action={
          !isEmployee ? (
            <Link to={`${ROUTE_PATHS.createService}?userId=${selectedUserId}`} className="primary-button">
              <Plus size={18} />
              Novo serviço
            </Link>
          ) : undefined
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {teamError ? <div className="feedback-card error-box">{teamError}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      {!isEmployee && employees.length > 0 ? (
        <div className="form-field">
          <label htmlFor="services-employee">Profissional</label>
          <select
            id="services-employee"
            className="form-input"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(Number(event.target.value))}
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.userId}>
                {employee.fullName}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="cards-grid three-cols compact-entity-grid">
        {isLoading ? (
          <div className="feedback-card">Carregando serviços...</div>
        ) : services.length === 0 ? (
          <div className="feedback-card">Nenhum serviço encontrado.</div>
        ) : (
          services.map((service) => (
            <PageCard key={service.id} className="compact-entity-card service-entity-card service-market-card">
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

                {!isEmployee ? <div className="entity-card-actions">
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
                </div> : null}
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
