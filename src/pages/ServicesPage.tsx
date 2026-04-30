import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { ServiceItem } from '../types/service.types'

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      try {
        setIsLoading(true)
        const response = await api.get<ServiceItem[]>(`/api/services?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setServices(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os serviços.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadServices()
    return () => {
      isMounted = false
    }
  }, [])

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

      <div className="cards-grid three-cols">
        {isLoading ? (
          <div className="feedback-card">Carregando serviços...</div>
        ) : services.length === 0 ? (
          <div className="feedback-card">Nenhum serviço encontrado.</div>
        ) : (
          services.map((service) => (
            <PageCard key={service.id}>
              <h3>{service.name}</h3>
              <p className="muted-text">Duração: {service.duration}</p>
              <p className="muted-text small-text">{service.description || 'Sem descrição cadastrada.'}</p>
              <span className="soft-pill top-gap">{service.priceFormatted}</span>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
