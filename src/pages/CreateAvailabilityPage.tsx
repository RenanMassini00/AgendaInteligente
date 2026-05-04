import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'

const weekdays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

export default function CreateAvailabilityPage() {
  const navigate = useNavigate()
  const [weekday, setWeekday] = useState('1')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')
  const [isActive, setIsActive] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!startTime || !endTime) {
      setErrorMessage('Informe o horário inicial e final.')
      return
    }

    if (startTime >= endTime) {
      setErrorMessage('O horário inicial deve ser menor que o horário final.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/api/availability', {
        userId: getCurrentUserId(),
        weekday: Number(weekday),
        startTime,
        endTime,
        isActive,
      })

      setSuccessMessage('Disponibilidade cadastrada com sucesso.')
      setTimeout(() => navigate(ROUTE_PATHS.availability), 700)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a disponibilidade.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Nova disponibilidade"
        description="Adicione um novo período disponível para atendimento."
        action={
          <Link to={ROUTE_PATHS.availability} className="secondary-button">
            Voltar
          </Link>
        }
      />

      <PageCard>
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid three-columns">
            <div>
              <label className="label" htmlFor="availability-weekday">Dia da semana</label>
              <select id="availability-weekday" className="text-input" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                {weekdays.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="availability-start">Hora inicial</label>
              <input id="availability-start" type="time" className="text-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div>
              <label className="label" htmlFor="availability-end">Hora final</label>
              <input id="availability-end" type="time" className="text-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Disponibilidade ativa</span>
          </label>

          {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
          {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

          <div className="section-actions">
            <Link to={ROUTE_PATHS.availability} className="secondary-button">Cancelar</Link>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar disponibilidade'}
            </button>
          </div>
        </form>
      </PageCard>
    </div>
  )
}
