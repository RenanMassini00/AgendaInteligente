import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Client } from '../types/client.types'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadClients() {
      try {
        setIsLoading(true)
        const response = await api.get<Client[]>(`/api/clients?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setClients(response)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os clientes.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadClients()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page-stack">
      <SectionHeader
        title="Clientes"
        description="Gerencie os clientes cadastrados no sistema."
        action={
          <Link to={ROUTE_PATHS.createClient} className="primary-button">
            Novo cliente
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <div className="cards-grid three-cols">
        {isLoading ? (
          <div className="feedback-card">Carregando clientes...</div>
        ) : clients.length === 0 ? (
          <div className="feedback-card">Nenhum cliente encontrado.</div>
        ) : (
          clients.map((client) => (
            <PageCard key={client.id}>
              <div className="split-row">
                <div>
                  <h3>{client.name}</h3>
                  <p className="muted-text">{client.phone}</p>
                  <p className="muted-text small-text">{client.email || 'Sem e-mail cadastrado'}</p>
                </div>
                <div className="avatar light">{client.name.charAt(0)}</div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
