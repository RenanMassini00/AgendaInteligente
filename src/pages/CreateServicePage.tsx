import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { getProfessionalTeamEmployees } from '../utils/professionalTeam'
import { api } from '../utils/api'
import type { Service } from '../types/service.types'
import type { ProfessionalTeamEmployee } from '../types/professional-team.types'

export default function CreateServicePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const isEditMode = Boolean(id)
  const requestedUserId = Number(searchParams.get('userId'))

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [price, setPrice] = useState('0')
  const [colorHex, setColorHex] = useState('#1f3b7a')
  const [teamEmployees, setTeamEmployees] = useState<ProfessionalTeamEmployee[]>([])
  const [employeeUserId, setEmployeeUserId] = useState<number | null>(null)
  const [teamLoadError, setTeamLoadError] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    void loadFormData()
  }, [id, requestedUserId])

  async function loadFormData() {
    try {
      setIsLoading(true)
      setTeamLoadError('')
      const [employees, service] = await Promise.all([
        getProfessionalTeamEmployees(),
        isEditMode ? api.get<Service>(`/api/services/${id}`) : Promise.resolve(null),
      ])
      const activeEmployees = employees.filter((employee) => employee.isActive)
      setTeamEmployees(activeEmployees)
      const requestedEmployee = activeEmployees.find(
        (employee) => employee.userId === requestedUserId
      )
      setEmployeeUserId(
        service?.userId ??
          requestedEmployee?.userId ??
          activeEmployees[0]?.userId ??
          getCurrentUserId()
      )

      if (service) {
        setName(service.name || '')
        setDescription(service.description || '')
        setDurationMinutes(String(service.durationMinutes || 60))
        setPrice(String(service.price || 0))
        setColorHex(service.colorHex || '#1f3b7a')
      }
      setErrorMessage('')
    } catch (error) {
      setTeamLoadError('Não foi possível carregar a equipe. Tente novamente antes de salvar.')
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível carregar os dados do serviço.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (teamLoadError || employeeUserId === null) {
      setErrorMessage('Carregue a equipe e selecione um funcionário antes de salvar.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const payload = {
        userId: employeeUserId,
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
          {teamEmployees.length > 0 ? (
            <div className="form-field">
              <label htmlFor="service-employee">Profissional responsável</label>
              <select
                id="service-employee"
                className="form-input"
                value={employeeUserId ?? ''}
                onChange={(event) => setEmployeeUserId(Number(event.target.value))}
                required
              >
                {teamEmployees.map((employee) => (
                  <option key={employee.id} value={employee.userId}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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