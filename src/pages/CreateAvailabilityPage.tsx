import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Layers3, RotateCcw, Save, X } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'

type AvailabilityResponse = {
  id: number
  weekday: number
  weekdayName: string
  startTime: string
  endTime: string
  isActive: boolean
}

type AvailabilityDateResponse = {
  id: number
  availableDate: string
  startTime: string
  endTime: string
}

const WEEKDAYS = [
  { value: 0, short: 'Dom', full: 'Domingo' },
  { value: 1, short: 'Seg', full: 'Segunda-feira' },
  { value: 2, short: 'Ter', full: 'Terça-feira' },
  { value: 3, short: 'Qua', full: 'Quarta-feira' },
  { value: 4, short: 'Qui', full: 'Quinta-feira' },
  { value: 5, short: 'Sex', full: 'Sexta-feira' },
  { value: 6, short: 'Sáb', full: 'Sábado' },
]

export default function CreateAvailabilityPage() {
  const userId = getCurrentUserId()

  const [recurringItems, setRecurringItems] = useState<AvailabilityResponse[]>([])
  const [dateItems, setDateItems] = useState<AvailabilityDateResponse[]>([])

  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5])
  const [recurringStartTime, setRecurringStartTime] = useState('08:00')
  const [recurringEndTime, setRecurringEndTime] = useState('18:00')
  const [recurringIsActive, setRecurringIsActive] = useState(true)
  const [editingRecurringId, setEditingRecurringId] = useState<number | null>(null)

  const [specificDate, setSpecificDate] = useState('')
  const [specificStartTime, setSpecificStartTime] = useState('08:00')
  const [specificEndTime, setSpecificEndTime] = useState('18:00')
  const [editingDateId, setEditingDateId] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingRecurring, setIsSavingRecurring] = useState(false)
  const [isSavingDate, setIsSavingDate] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedWeekdayLabels = useMemo(() => {
    return WEEKDAYS
      .filter((item) => selectedWeekdays.includes(item.value))
      .map((item) => item.full)
      .join(', ')
  }, [selectedWeekdays])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [recurringResponse, datesResponse] = await Promise.all([
        api.get<AvailabilityResponse[]>(`/api/availability?userId=${userId}`),
        api.get<AvailabilityDateResponse[]>(`/api/availability/dates?userId=${userId}`),
      ])

      setRecurringItems(recurringResponse ?? [])
      setDateItems(datesResponse ?? [])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar a disponibilidade.')
    } finally {
      setIsLoading(false)
    }
  }

  function clearMessages() {
    setErrorMessage('')
    setSuccessMessage('')
  }

  function toggleWeekday(weekday: number) {
    clearMessages()

    setSelectedWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((item) => item !== weekday)
        : [...current, weekday].sort((a, b) => a - b)
    )
  }

  function selectWeekdays(items: number[]) {
    clearMessages()
    setSelectedWeekdays(items)
  }

  function resetRecurringForm() {
    setSelectedWeekdays([1, 2, 3, 4, 5])
    setRecurringStartTime('08:00')
    setRecurringEndTime('18:00')
    setRecurringIsActive(true)
    setEditingRecurringId(null)
  }

  function resetDateForm() {
    setSpecificDate('')
    setSpecificStartTime('08:00')
    setSpecificEndTime('18:00')
    setEditingDateId(null)
  }

  async function handleSaveRecurring() {
    try {
      clearMessages()

      if (!recurringStartTime || !recurringEndTime) {
        setErrorMessage('Informe a hora inicial e a hora final.')
        return
      }

      if (recurringStartTime >= recurringEndTime) {
        setErrorMessage('A hora final deve ser maior que a hora inicial.')
        return
      }

      if (editingRecurringId) {
        if (selectedWeekdays.length !== 1) {
          setErrorMessage('Na edição, selecione apenas um dia da semana.')
          return
        }

        setIsSavingRecurring(true)

        await api.put(`/api/availability/${editingRecurringId}`, {
          weekday: selectedWeekdays[0],
          startTime: recurringStartTime,
          endTime: recurringEndTime,
          isActive: recurringIsActive,
        })

        setSuccessMessage('Recorrência atualizada com sucesso.')
      } else {
        if (selectedWeekdays.length === 0) {
          setErrorMessage('Selecione pelo menos um dia da semana.')
          return
        }

        setIsSavingRecurring(true)

        await Promise.all(
          selectedWeekdays.map((weekday) =>
            api.post('/api/availability', {
              userId,
              weekday,
              startTime: recurringStartTime,
              endTime: recurringEndTime,
              isActive: recurringIsActive,
            })
          )
        )

        setSuccessMessage('Recorrência salva com sucesso.')
      }

      resetRecurringForm()
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a recorrência.')
    } finally {
      setIsSavingRecurring(false)
    }
  }

  async function handleEditRecurring(item: AvailabilityResponse) {
    clearMessages()
    setEditingRecurringId(item.id)
    setSelectedWeekdays([item.weekday])
    setRecurringStartTime(item.startTime)
    setRecurringEndTime(item.endTime)
    setRecurringIsActive(item.isActive)
  }

  async function handleDeleteRecurring(id: number) {
    const confirmed = window.confirm('Deseja excluir esta recorrência?')
    if (!confirmed) return

    try {
      clearMessages()
      await api.delete(`/api/availability/${id}`)
      setSuccessMessage('Recorrência excluída com sucesso.')
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir a recorrência.')
    }
  }

  async function handleSaveDate() {
    try {
      clearMessages()

      if (!specificDate) {
        setErrorMessage('Informe a data específica.')
        return
      }

      if (!specificStartTime || !specificEndTime) {
        setErrorMessage('Informe a hora inicial e a hora final da data específica.')
        return
      }

      if (specificStartTime >= specificEndTime) {
        setErrorMessage('A hora final deve ser maior que a hora inicial.')
        return
      }

      setIsSavingDate(true)

      if (editingDateId) {
        await api.put(`/api/availability/dates/${editingDateId}`, {
          availableDate: specificDate,
          startTime: specificStartTime,
          endTime: specificEndTime,
        })

        setSuccessMessage('Data específica atualizada com sucesso.')
      } else {
        await api.post(`/api/availability/dates?userId=${userId}`, {
          availableDate: specificDate,
          startTime: specificStartTime,
          endTime: specificEndTime,
        })

        setSuccessMessage('Data específica adicionada com sucesso.')
      }

      resetDateForm()
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a data específica.')
    } finally {
      setIsSavingDate(false)
    }
  }

  function handleEditDate(item: AvailabilityDateResponse) {
    clearMessages()
    setEditingDateId(item.id)
    setSpecificDate(item.availableDate)
    setSpecificStartTime(item.startTime)
    setSpecificEndTime(item.endTime)
  }

  async function handleDeleteDate(id: number) {
    const confirmed = window.confirm('Deseja excluir esta data específica?')
    if (!confirmed) return

    try {
      clearMessages()
      await api.delete(`/api/availability/dates/${id}`)
      setSuccessMessage('Data específica excluída com sucesso.')
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir a data específica.')
    }
  }

  return (
    <div className="page-stack availability-editor-page">
      <SectionHeader
        title="Editar disponibilidade"
        description="Monte sua rotina semanal e adicione exceções para datas especiais."
        action={
          <Link to={ROUTE_PATHS.availability} className="secondary-button">
            <X size={18} />
            Voltar
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="availability-editor-grid availability-editor-grid--forms">
        <PageCard className="availability-editor-card">
          <div className="card-stack">
            <div className="availability-editor-card-title">
              <span>
                <Layers3 size={18} />
              </span>
              <div>
                <h3>Rotina semanal</h3>
                <p className="muted-text">
                  Aplique o mesmo horário em vários dias da semana.
                </p>
              </div>
            </div>

            <div className="availability-editor-preview">
              <strong>{selectedWeekdays.length || 0}</strong>
              <span>dia(s) selecionado(s)</span>
              <small>{selectedWeekdayLabels || 'Escolha os dias da semana'}</small>
            </div>

            <div>
              <p className="muted-text">
                Selecione atalhos ou toque nos dias desejados.
              </p>
            </div>

            <div className="availability-shortcuts">
              <button
                type="button"
                className="secondary-button"
                onClick={() => selectWeekdays([1, 2, 3, 4, 5])}
              >
                Seg a Sex
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => selectWeekdays([0, 1, 2, 3, 4, 5, 6])}
              >
                Todos
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => selectWeekdays([])}
              >
                Limpar
              </button>
            </div>

            <div className="weekday-chip-list">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedWeekdays.includes(day.value)

                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`weekday-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleWeekday(day.value)}
                  >
                    {day.short}
                  </button>
                )
              })}
            </div>

            <div className="selection-preview">
              <strong>Dias escolhidos:</strong>{' '}
              {selectedWeekdayLabels || 'Nenhum dia selecionado'}
            </div>

            <div className="form-grid three-columns">
              <div className="form-field">
                <label>Hora inicial</label>
                <div className="availability-time-input">
                  <Clock3 size={17} />
                  <input
                    type="time"
                    value={recurringStartTime}
                    onChange={(e) => setRecurringStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Hora final</label>
                <div className="availability-time-input">
                  <Clock3 size={17} />
                  <input
                    type="time"
                    value={recurringEndTime}
                    onChange={(e) => setRecurringEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field checkbox-field">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={recurringIsActive}
                    onChange={(e) => setRecurringIsActive(e.target.checked)}
                  />
                  Disponibilidade ativa
                </label>
              </div>
            </div>

            <div className="actions-row">
              {editingRecurringId ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetRecurringForm}
                >
                  <RotateCcw size={17} />
                  Cancelar edição
                </button>
              ) : null}

              <button
                type="button"
                className="primary-button"
                onClick={handleSaveRecurring}
                disabled={isSavingRecurring}
              >
                <Save size={17} />
                {isSavingRecurring
                  ? 'Salvando...'
                  : editingRecurringId
                    ? 'Atualizar recorrência'
                    : 'Salvar recorrência'}
              </button>
            </div>
          </div>
        </PageCard>

        <PageCard className="availability-editor-card">
          <div className="card-stack">
            <div className="availability-editor-card-title">
              <span>
                <CalendarDays size={18} />
              </span>
              <div>
                <h3>Data específica</h3>
                <p className="muted-text">
                  Use para dias especiais, encaixes ou horários fora da rotina semanal.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Data</label>
                <div className="availability-time-input">
                  <CalendarDays size={17} />
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Hora inicial</label>
                <div className="availability-time-input">
                  <Clock3 size={17} />
                  <input
                    type="time"
                    value={specificStartTime}
                    onChange={(e) => setSpecificStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Hora final</label>
                <div className="availability-time-input">
                  <Clock3 size={17} />
                  <input
                    type="time"
                    value={specificEndTime}
                    onChange={(e) => setSpecificEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="actions-row">
              {editingDateId ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetDateForm}
                >
                  <RotateCcw size={17} />
                  Cancelar edição
                </button>
              ) : null}

              <button
                type="button"
                className="primary-button"
                onClick={handleSaveDate}
                disabled={isSavingDate}
              >
                <Save size={17} />
                {isSavingDate
                  ? 'Salvando...'
                  : editingDateId
                    ? 'Atualizar data'
                    : 'Adicionar data'}
              </button>
            </div>
          </div>
        </PageCard>
      </div>

      <div className="availability-editor-grid availability-editor-grid--lists">
        <PageCard className="availability-editor-card">
          <div className="card-stack">
            <div className="availability-editor-list-title">
              <h3>Recorrências cadastradas</h3>
              <p className="muted-text">Gerencie os dias fixos da semana.</p>
            </div>

            {isLoading ? (
              <div className="feedback-card">Carregando recorrências...</div>
            ) : recurringItems.length === 0 ? (
              <div className="feedback-card">Nenhuma recorrência cadastrada.</div>
            ) : (
              <div className="stack-list">
                {recurringItems.map((item) => (
                  <div key={item.id} className="availability-list-item">
                    <div>
                      <strong>{item.weekdayName}</strong>
                      <p className="muted-text">
                        {item.startTime} às {item.endTime}
                      </p>
                      <p className="muted-text small-text">
                        {item.isActive ? 'Ativa' : 'Inativa'}
                      </p>
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEditRecurring(item)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeleteRecurring(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>

        <PageCard className="availability-editor-card">
          <div className="card-stack">
            <div className="availability-editor-list-title">
              <h3>Datas específicas</h3>
              <p className="muted-text">Gerencie exceções e horários especiais.</p>
            </div>

            {isLoading ? (
              <div className="feedback-card">Carregando datas específicas...</div>
            ) : dateItems.length === 0 ? (
              <div className="feedback-card">Nenhuma data específica cadastrada.</div>
            ) : (
              <div className="stack-list">
                {dateItems.map((item) => (
                  <div key={item.id} className="availability-list-item">
                    <div>
                      <strong>{item.availableDate}</strong>
                      <p className="muted-text">
                        {item.startTime} às {item.endTime}
                      </p>
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEditDate(item)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeleteDate(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}
