import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Service } from '../types/service.types'

export default function CreateServicePage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const isEditMode = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [price, setPrice] = useState('0')
  const [colorHex, setColorHex] = useState('#1f3b7a')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    loadService()
  }, [id])

  async function loadService() {
    try {
      setIsLoading(true)
      const response = await api.get<Service>(`/api/services/${id}`)
      setName(response.name || '')
      setDescription(response.description || '')
      setDurationMinutes(String(response.durationMinutes || 60))
      setPrice(String(response.price || 0))
      setColorHex(response.colorHex || '#1f3b7a')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível carregar o serviço.'
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
        name,
        description: description || null,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        colorHex: colorHex || null,
      }

      if (isEditMode) {
        await api.put(`/api/services/${id}`, payload)
      } else {
        await api.post('/api/services', payload)
      }

      navigate(ROUTE_PATHS.services)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar o serviço.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="feedback-card">Carregando serviço...</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title={isEditMode ? 'Editar serviço' : 'Novo serviço'}
        description={
          isEditMode
            ? 'Atualize os dados do serviço.'
            : 'Cadastre um novo serviço para agendamento.'
        }
        action={
          <Link to={ROUTE_PATHS.services} className="secondary-button">
            Voltar
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <PageCard>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Nome do serviço</label>
            <input
              id="name"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="durationMinutes">Duração em minutos</label>
            <input
              id="durationMinutes"
              type="number"
              className="form-input"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="price">Preço</label>
            <input
              id="price"
              type="number"
              step="0.01"
              className="form-input"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="colorHex">Cor</label>
            <input
              id="colorHex"
              type="color"
              className="form-input"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              className="form-input"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="actions-row full-width">
            <Link to={ROUTE_PATHS.services} className="secondary-button">
              Cancelar
            </Link>

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : isEditMode
                  ? 'Atualizar serviço'
                  : 'Salvar serviço'}
            </button>
          </div>
        </form>
      </PageCard>
    </div>
  )
}