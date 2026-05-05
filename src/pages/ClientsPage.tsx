import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Client } from '../types/client.types'

export default function ClientsPage() {
  const navigate = useNavigate()

  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      setIsLoading(true)
      const response = await api.get<Client[]>(`/api/clients?userId=${getCurrentUserId()}`)
      setClients(response)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível carregar os clientes.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteClient(id: number) {
    const confirmed = window.confirm('Deseja realmente excluir este cliente?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/clients/${id}`)
      setSuccessMessage('Cliente excluído com sucesso.')
      await loadClients()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível excluir o cliente.'
      )
    }
  }

  function handleEditClient(id: number) {
    navigate(`/clients/${id}/edit`)
  }

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
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="cards-grid three-cols">
        {isLoading ? (
          <div className="feedback-card">Carregando clientes...</div>
        ) : clients.length === 0 ? (
          <div className="feedback-card">Nenhum cliente encontrado.</div>
        ) : (
          clients.map((client) => {
            const displayName = client.fullName || 'Cliente'
            const initial = displayName.charAt(0).toUpperCase()

            return (
              <PageCard key={client.id}>
                <div className="entity-card">
                  <div className="split-row">
                    <div>
                      <h3>{displayName}</h3>
                      <p className="muted-text">{client.phone}</p>
                      <p className="muted-text small-text">
                        {client.email || 'Sem e-mail cadastrado'}
                      </p>
                    </div>

                    <div className="avatar light">{initial}</div>
                  </div>

                  <div className="entity-card-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEditClient(client.id)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </PageCard>
            )
          })
        )}
      </div>
    </div>
  )
}