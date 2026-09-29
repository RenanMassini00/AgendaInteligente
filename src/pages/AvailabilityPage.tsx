import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CalendarClock, Clock3, Pencil, Plus } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { getProfessionalTeamEmployees } from '../utils/professionalTeam'
import type { ProfessionalTeamEmployee } from '../types/professional-team.types'
import { api } from '../utils/api'
import type { AvailabilityItem } from '../types/availability.types'

export default function AvailabilityPage() {
  const ownerUserId = getCurrentUserId()
  const [items, setItems] = useState<AvailabilityItem[]>([])
  const [employees, setEmployees] = useState<ProfessionalTeamEmployee[]>([])
  const [selectedUserId, setSelectedUserId] = useState(ownerUserId)
  const [isTeamLoaded, setIsTeamLoaded] = useState(false)
  const [teamError, setTeamError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadTeam() {
      try {
        const response = await getProfessionalTeamEmployees()
        if (isMounted) {
          const activeEmployees = response.filter((employee) => employee.isActive)
          setEmployees(activeEmployees)
          if (activeEmployees.length > 0) {
            setSelectedUserId(activeEmployees[0].userId)
          }
        }
      } catch (error) {
        if (isMounted) {
          setTeamError(
            error instanceof Error ? error.message : 'Não foi possível carregar a equipe.'
          )
        }
      } finally {
        if (isMounted) {
          setIsTeamLoaded(true)
        }
      }
    }

    void loadTeam()
    return () => {
      isMounted = false
    }
  }, [ownerUserId])

  useEffect(() => {
    if (!isTeamLoaded) return
    let isMounted = true

    async function loadAvailability() {
      try {
        setIsLoading(true)
        const response = await api.get<AvailabilityItem[]>(
          `/api/availability?userId=${selectedUserId}`
        )
        if (isMounted) {
          setItems(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Não foi possível carregar a disponibilidade.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadAvailability()
    return () => {
      isMounted = false
    }
  }, [isTeamLoaded, selectedUserId])

  const activeItems = items.filter((item) => item.isActive)

  return (
    <div className="page-stack management-page">
      <SectionHeader
        title="Disponibilidade"
        description="Veja os horários recorrentes do profissional selecionado e ajuste sua agenda."
        action={
          <Link
            to={`${ROUTE_PATHS.createAvailability}?userId=${selectedUserId}`}
            className="primary-button"
          >
            <Pencil size={18} />
            Editar agenda
          </Link>
        }
      />

      {teamError ? <div className="feedback-card error-box">{teamError}</div> : null}
      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      {employees.length > 0 ? (
        <div className="form-field">
          <label htmlFor="availability-employee">Profissional</label>
          <select
            id="availability-employee"
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

      <div className="availability-summary-strip">
        <PageCard className="availability-summary-card">
          <CalendarClock size={20} />
          <div>
            <strong>{activeItems.length}</strong>
            <span>dias ativos</span>
          </div>
        </PageCard>

        <PageCard className="availability-summary-card">
          <Clock3 size={20} />
          <div>
            <strong>{items.length}</strong>
            <span>regras cadastradas</span>
          </div>
        </PageCard>

        <Link
          to={`${ROUTE_PATHS.createAvailability}?userId=${selectedUserId}`}
          className="availability-summary-action"
        >
          <Plus size={18} />
          Nova regra
        </Link>
      </div>

      <div className="cards-grid three-cols compact-entity-grid availability-overview-grid">
        {isLoading ? (
          <div className="feedback-card">Carregando disponibilidade...</div>
        ) : items.length === 0 ? (
          <div className="feedback-card">Nenhuma disponibilidade encontrada.</div>
        ) : (
          items.map((item) => (
            <PageCard key={item.id} className="availability-day-card">
              <div className="availability-day-card-head">
                <div>
                  <span>{item.weekdayName.slice(0, 3)}</span>
                  <h3>{item.weekdayName}</h3>
                </div>

                <span className={`availability-state ${item.isActive ? 'active' : 'inactive'}`}>
                  {item.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="availability-time-row">
                <Clock3 size={17} />
                <strong>{item.startTime} às {item.endTime}</strong>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
