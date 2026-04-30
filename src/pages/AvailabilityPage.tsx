import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

  return (
    <div className="page-stack">
      <SectionHeader
        title="Disponibilidade"
        description="Defina os dias e horários disponíveis para atendimento."
        action={
          <Link to={ROUTE_PATHS.createAvailability} className="primary-button">
            Editar agenda
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <div className="cards-grid two-cols">
        {isLoading ? (
          <div className="feedback-card">Carregando disponibilidade...</div>
        ) : items.length === 0 ? (
          <div className="feedback-card">Nenhuma disponibilidade encontrada.</div>
        ) : (
          items.map((item) => (
            <PageCard key={item.id}>
              <h3>{item.weekdayName}</h3>
              <p className="muted-text">Horário disponível</p>
              <span className="soft-pill top-gap">{item.startTime} às {item.endTime}</span>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
