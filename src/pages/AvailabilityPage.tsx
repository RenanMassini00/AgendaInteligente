import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CalendarClock, Clock3, Pencil, Plus } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { AvailabilityItem } from '../types/availability.types'

export default function AvailabilityPage() {
  const [items, setItems] = useState<AvailabilityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAvailability() {
      try {
        setIsLoading(true)
        const response = await api.get<AvailabilityItem[]>(`/api/availability?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setItems(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar a disponibilidade.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAvailability()
    return () => {
      isMounted = false
    }
  }, [])

  const activeItems = items.filter((item) => item.isActive)

  return (
    <div className="page-stack management-page">
      <SectionHeader
        title="Disponibilidade"
        description="Veja seus horários recorrentes e ajuste rapidamente sua agenda."
        action={
          <Link to={ROUTE_PATHS.createAvailability} className="primary-button">
            <Pencil size={18} />
            Editar agenda
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

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

        <Link to={ROUTE_PATHS.createAvailability} className="availability-summary-action">
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
