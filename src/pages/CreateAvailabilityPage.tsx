import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'

type WeeklyAvailability = {
  id: number
  weekDay: number
  weekday?: number
  weekdayName?: string
  startTime: string
  endTime: string
  isActive: boolean
}

type AvailabilityDate = {
  id: number
  availableDate: string
  startTime: string
  endTime: string
}

const weekDays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
]

const weekDayFullMap: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
}

function normalizeWeekDay(item: WeeklyAvailability) {
  return item.weekDay ?? item.weekday ?? 0
}

function sortWeekly(items: WeeklyAvailability[]) {
  return [...items].sort(
    (a, b) =>
      normalizeWeekDay(a) - normalizeWeekDay(b) ||
      a.startTime.localeCompare(b.startTime)
  )
}

function sortDates(items: AvailabilityDate[]) {
  return [...items].sort(
    (a, b) =>
      a.availableDate.localeCompare(b.availableDate) ||
      a.startTime.localeCompare(b.startTime)
  )
}

export default function CreateAvailabilityPage() {
  const userId = getCurrentUserId()

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')
  const [editingWeeklyId, setEditingWeeklyId] = useState<number | null>(null)

  const [specificDate, setSpecificDate] = useState('')
  const [specificStartTime, setSpecificStartTime] = useState('08:00')
  const [specificEndTime, setSpecificEndTime] = useState('18:00')
  const [editingDateId, setEditingDateId] = useState<number | null>(null)

  const [weeklyItems, setWeeklyItems] = useState<WeeklyAvailability[]>([])
  const [dateItems, setDateItems] = useState<AvailabilityDate[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingRecurring, setIsSavingRecurring] = useState(false)
  const [isSavingSpecificDate, setIsSavingSpecificDate] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadData() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const weekly = await api.get<WeeklyAvailability[]>(`/api/availability?userId=${userId}`)
      setWeeklyItems(sortWeekly(weekly))

      try {
        const dates = await api.get<AvailabilityDate[]>(`/api/availability/dates?userId=${userId}`)
        setDateItems(sortDates(dates))
      } catch {
        setDateItems([])
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as disponibilidades.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function toggleDay(day: number) {
    if (editingWeeklyId) {
      setSelectedDays([day])
      return
    }

    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b)
    )
  }

  function selectWeekdays() {
    if (editingWeeklyId) {
      return
    }

    setSelectedDays([1, 2, 3, 4, 5])
  }

  function selectAllDays() {
    if (editingWeeklyId) {
      return
    }

    setSelectedDays([0, 1, 2, 3, 4, 5, 6])
  }

  function clearDays() {
    setSelectedDays([])
  }

  function resetRecurringForm() {
    setEditingWeeklyId(null)
    setSelectedDays([1, 2, 3, 4, 5])
    setStartTime('08:00')
    setEndTime('18:00')
  }

  function resetDateForm() {
    setEditingDateId(null)
    setSpecificDate('')
    setSpecificStartTime('08:00')
    setSpecificEndTime('18:00')
  }

  async function handleSaveRecurring() {
    if (selectedDays.length === 0) {
      setErrorMessage('Selecione pelo menos um dia da semana.')
      setSuccessMessage('')
      return
    }

    if (!startTime || !endTime) {
      setErrorMessage('Preencha hora inicial e hora final.')
      setSuccessMessage('')
      return
    }

    if (startTime >= endTime) {
      setErrorMessage('A hora final deve ser maior que a hora inicial.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSavingRecurring(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (editingWeeklyId) {
        if (selectedDays.length !== 1) {
          setErrorMessage('Na edição, selecione apenas um dia.')
          setSuccessMessage('')
          setIsSavingRecurring(false)
          return
        }

        await api.put(`/api/availability/${editingWeeklyId}?userId=${userId}`, {
          weekDay: selectedDays[0],
          weekday: selectedDays[0],
          startTime,
          endTime,
          isActive: true,
        })

        setSuccessMessage('Recorrência atualizada com sucesso.')
      } else {
        await Promise.all(
          selectedDays.map((weekDay) =>
            api.post(`/api/availability?userId=${userId}`, {
              weekDay,
              weekday: weekDay,
              startTime,
              endTime,
              isActive: true,
            })
          )
        )

        setSuccessMessage('Disponibilidade recorrente salva com sucesso.')
      }

      await loadData()
      resetRecurringForm()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a disponibilidade recorrente.'
      )
    } finally {
      setIsSavingRecurring(false)
    }
  }

  async function handleSaveSpecificDate() {
    if (!specificDate) {
      setErrorMessage('Selecione uma data.')
      setSuccessMessage('')
      return
    }

    if (!specificStartTime || !specificEndTime) {
      setErrorMessage('Preencha hora inicial e hora final da data específica.')
      setSuccessMessage('')
      return
    }

    if (specificStartTime >= specificEndTime) {
      setErrorMessage('A hora final da data específica deve ser maior que a hora inicial.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSavingSpecificDate(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (editingDateId) {
        await api.put(`/api/availability/dates/${editingDateId}?userId=${userId}`, {
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

        setSuccessMessage('Disponibilidade por data salva com sucesso.')
      }

      await loadData()
      resetDateForm()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a disponibilidade por data.'
      )
    } finally {
      setIsSavingSpecificDate(false)
    }
  }

  function handleEditRecurring(item: WeeklyAvailability) {
    const day = normalizeWeekDay(item)

    setEditingWeeklyId(item.id)
    setSelectedDays([day])
    setStartTime(item.startTime.slice(0, 5))
    setEndTime(item.endTime.slice(0, 5))
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleEditDate(item: AvailabilityDate) {
    setEditingDateId(item.id)
    setSpecificDate(item.availableDate)
    setSpecificStartTime(item.startTime.slice(0, 5))
    setSpecificEndTime(item.endTime.slice(0, 5))
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleDeleteRecurring(id: number) {
    const confirmed = window.confirm('Deseja realmente excluir esta recorrência?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/availability/${id}?userId=${userId}`)
      await loadData()

      if (editingWeeklyId === id) {
        resetRecurringForm()
      }

      setSuccessMessage('Recorrência excluída com sucesso.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a recorrência.'
      )
    }
  }

  async function handleDeleteDate(id: number) {
    const confirmed = window.confirm('Deseja realmente excluir esta data específica?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/availability/dates/${id}?userId=${userId}`)
      await loadData()

      if (editingDateId === id) {
        resetDateForm()
      }

      setSuccessMessage('Data específica excluída com sucesso.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a data específica.'
      )
    }
  }

  const selectedDaysLabel = useMemo(() => {
    if (selectedDays.length === 0) return 'Nenhum dia selecionado'
    return selectedDays.map((day) => weekDayFullMap[day]).join(', ')
  }, [selectedDays])

  if (isLoading) {
    return <div className="feedback-card">Carregando disponibilidades...</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Nova disponibilidade"
        description="Cadastre horários recorrentes e também datas específicas."
        action={
          <Link to={ROUTE_PATHS.availability} className="secondary-button">
            Voltar
          </Link>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="cards-grid two-cols availability-builder-grid">
        <PageCard>
          <div className="availability-section">
            <h3>
              {editingWeeklyId ? 'Editar recorrência' : 'Disponibilidade recorrente'}
            </h3>
            <p className="muted-text">
              Aplique o mesmo horário em vários dias da semana.
            </p>

            <div className="availability-quick-actions">
              <button type="button" className="secondary-button" onClick={selectWeekdays}>
                Seg a Sex
              </button>
              <button type="button" className="secondary-button" onClick={selectAllDays}>
                Todos
              </button>
              <button type="button" className="secondary-button" onClick={clearDays}>
                Limpar
              </button>
            </div>

            <div className="weekday-chip-list">
              {weekDays.map((day) => {
                const isSelected = selectedDays.includes(day.value)

                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`weekday-chip ${isSelected ? 'selected' : ''}`.trim()}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>

            <div className="selected-days-preview">
              <strong>Dias escolhidos:</strong> {selectedDaysLabel}
            </div>

            <div className="time-block">
              <div className="time-block-header">
                <h4>Horário da recorrência</h4>
                <p className="muted-text">Defina o intervalo padrão para os dias selecionados.</p>
              </div>

              <div className="time-range-grid">
                <div className="form-field">
                  <label htmlFor="startTime">Hora inicial</label>
                  <input
                    id="startTime"
                    type="time"
                    className="form-input large-input"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="endTime">Hora final</label>
                  <input
                    id="endTime"
                    type="time"
                    className="form-input large-input"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              {editingWeeklyId ? (
                <>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetRecurringForm}
                  >
                    Cancelar edição
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSaveRecurring}
                    disabled={isSavingRecurring}
                  >
                    {isSavingRecurring ? 'Salvando...' : 'Atualizar recorrência'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSaveRecurring}
                  disabled={isSavingRecurring}
                >
                  {isSavingRecurring ? 'Salvando...' : 'Salvar recorrência'}
                </button>
              )}
            </div>
          </div>
        </PageCard>

        <PageCard>
          <div className="availability-section">
            <h3>{editingDateId ? 'Editar data específica' : 'Disponibilidade por data'}</h3>
            <p className="muted-text">
              Use para dias especiais, encaixes ou horários fora da rotina semanal.
            </p>

            <div className="date-block">
              <div className="date-block-header">
                <h4>Nova data específica</h4>
                <p className="muted-text">Cadastre um dia único com horário personalizado.</p>
              </div>

              <div className="form-field">
                <label htmlFor="specificDate">Data</label>
                <input
                  id="specificDate"
                  type="date"
                  className="form-input large-input"
                  value={specificDate}
                  onChange={(event) => setSpecificDate(event.target.value)}
                />
              </div>

              <div className="time-range-grid">
                <div className="form-field">
                  <label htmlFor="specificStartTime">Hora inicial</label>
                  <input
                    id="specificStartTime"
                    type="time"
                    className="form-input large-input"
                    value={specificStartTime}
                    onChange={(event) => setSpecificStartTime(event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="specificEndTime">Hora final</label>
                  <input
                    id="specificEndTime"
                    type="time"
                    className="form-input large-input"
                    value={specificEndTime}
                    onChange={(event) => setSpecificEndTime(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              {editingDateId ? (
                <>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetDateForm}
                  >
                    Cancelar edição
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSaveSpecificDate}
                    disabled={isSavingSpecificDate}
                  >
                    {isSavingSpecificDate ? 'Salvando...' : 'Atualizar data'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSaveSpecificDate}
                  disabled={isSavingSpecificDate}
                >
                  {isSavingSpecificDate ? 'Salvando...' : 'Adicionar data'}
                </button>
              )}
            </div>
          </div>
        </PageCard>
      </div>

      <div className="cards-grid two-cols availability-summary-grid">
        <PageCard>
          <h3>Recorrências cadastradas</h3>

          <div className="availability-summary-list top-gap">
            {weeklyItems.length === 0 ? (
              <div className="empty-state">Nenhuma recorrência cadastrada.</div>
            ) : (
              weeklyItems.map((item) => {
                const weekday = normalizeWeekDay(item)

                return (
                  <div key={item.id} className="availability-summary-item">
                    <div>
                      <strong>{item.weekdayName || weekDayFullMap[weekday]}</strong>
                      <p className="muted-text">
                        {item.startTime.slice(0, 5)} às {item.endTime.slice(0, 5)}
                      </p>
                    </div>

                    <div className="availability-item-actions">
                      <span className="soft-pill">{item.isActive ? 'Ativo' : 'Inativo'}</span>
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
                )
              })
            )}
          </div>
        </PageCard>

        <PageCard>
          <h3>Datas específicas</h3>

          <div className="availability-summary-list top-gap">
            {dateItems.length === 0 ? (
              <div className="empty-state">
                Nenhuma data específica cadastrada.
              </div>
            ) : (
              dateItems.map((item) => (
                <div key={item.id} className="availability-summary-item">
                  <div>
                    <strong>{item.availableDate}</strong>
                    <p className="muted-text">
                      {item.startTime.slice(0, 5)} às {item.endTime.slice(0, 5)}
                    </p>
                  </div>

                  <div className="availability-item-actions">
                    <span className="soft-pill">Especial</span>
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
              ))
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}