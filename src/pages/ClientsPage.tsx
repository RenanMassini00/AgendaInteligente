import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, Pencil, Plus, Trash2 } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import type { Client } from '../types/client.types'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'

function getInitials(name?: string | null) {
  if (!name?.trim()) return 'C'

  const parts = name.trim().split(' ').filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function formatPhone(phone?: string | null) {
  return phone?.trim() || 'Sem telefone cadastrado'
}

function formatEmail(email?: string | null) {
  return email?.trim() || 'Sem e-mail cadastrado'
}

function formatClientNote(notes?: string | null) {
  return notes?.trim() || 'Cliente cadastrado'
}

export default function ClientsPage() {
  const navigate = useNavigate()

  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const userId = useMemo(() => getCurrentUserId(), [])

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<Client[]>(`/api/clients?userId=${userId}`)
      setClients(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar os clientes.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleCreate() {
    navigate(ROUTE_PATHS.createClient)
  }

  function handleEdit(clientId: number) {
    navigate(`/clients/${clientId}/edit`)
  }

  async function handleDelete(clientId: number) {
    const confirmed = window.confirm('Deseja realmente excluir este cliente?')
    if (!confirmed) return

    try {
      await api.delete(`/api/clients/${clientId}`)
      await loadClients()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel excluir o cliente.'
      )
    }
  }

  return (
    <div className="page-stack clients-page">
      <SectionHeader
        title="Clientes"
        description="Gerencie contatos, telefones e informacoes rapidas dos seus clientes."
        action={(
          <button type="button" className="primary-button small-button clients-add-button" onClick={handleCreate}>
            <Plus size={16} />
            Novo cliente
          </button>
        )}
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      {isLoading ? (
        <div className="feedback-card">Carregando clientes...</div>
      ) : clients.length === 0 ? (
        <div className="feedback-card">Nenhum cliente cadastrado ainda.</div>
      ) : (
        <div className="cards-grid three-cols compact-entity-grid clients-grid">
          {clients.map((client) => (
            <PageCard key={client.id} className="compact-entity-card client-card">
              <div className="entity-card">
                <div className="entity-card-head">
                  <div className="entity-icon client-icon">{getInitials(client.fullName)}</div>

                  <div className="entity-card-title">
                    <h3>{client.fullName || 'Cliente sem nome'}</h3>
                    <span>{formatClientNote(client.notes)}</span>
                  </div>
                </div>

                <div className="entity-card-meta-list entity-card-meta-list--inline">
                  <div className="entity-card-meta-item">
                    <Phone size={16} />
                    <strong>{formatPhone(client.phone)}</strong>
                  </div>

                  <div className="entity-card-meta-item">
                    <Mail size={16} />
                    <strong>{formatEmail(client.email)}</strong>
                  </div>
                </div>

                <div className="entity-card-actions client-card-actions">
                  <button
                    type="button"
                    className="secondary-button small-button"
                    onClick={() => handleEdit(client.id)}
                  >
                    <Pencil size={15} />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="danger-button small-button"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 size={15} />
                    Excluir
                  </button>
                </div>
              </div>
            </PageCard>
          ))}
        </div>
      )}
    </div>
  )
}
