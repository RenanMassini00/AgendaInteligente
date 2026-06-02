import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Client } from '../types/client.types'

export default function CreateClientPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const isEditMode = Boolean(id)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isEditMode) return

    loadClient()
  }, [id])

  async function loadClient() {
    try {
      setIsLoading(true)
      const response = await api.get<Client>(`/api/clients/${id}`)
      setFullName(response.fullName || '')
      setEmail(response.email || '')
      setPhone(response.phone || '')
      setBirthDate(response.birthDate || '')
      setNotes(response.notes || '')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível carregar o cliente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const payload = {
        userId: getCurrentUserId(),
        fullName,
        email: email || null,
        phone,
        birthDate: birthDate || null,
        notes: notes || null,
      }

      if (isEditMode) {
        await api.put(`/api/clients/${id}`, payload)
      } else {
        await api.post('/api/clients', payload)
      }

      navigate(ROUTE_PATHS.clients)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar o cliente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="feedback-card">Carregando cliente...</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title={isEditMode ? 'Editar cliente' : 'Novo cliente'}
        description={
          isEditMode
            ? 'Atualize as informações do cliente.'
            : 'Cadastre um novo cliente no sistema.'
        }
        action={
          <Link to={ROUTE_PATHS.clients} className="secondary-button">
            Voltar
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <PageCard>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label htmlFor="fullName">Nome completo</label>
            <input
              id="fullName"
              className="form-input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              className="form-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="birthDate">Data de nascimento</label>
            <input
              id="birthDate"
              type="date"
              className="form-input"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              className="form-input"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="actions-row full-width">
            <Link to={ROUTE_PATHS.clients} className="secondary-button">
              Cancelar
            </Link>

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : isEditMode
                  ? 'Atualizar cliente'
                  : 'Salvar cliente'}
            </button>
          </div>
        </form>
      </PageCard>
    </div>
  )
}