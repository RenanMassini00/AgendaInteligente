import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Mail, Phone, User, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import { api } from '../utils/api'
import type {
  PublicAvailableSlots,
  PublicBookingResponse,
  PublicProfessional,
} from '../types/public-booking.types'

function getTodayValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`
}

function normalizeStartTime(time: string) {
  return time.length === 5 ? `${time}:00` : time
}

function formatDateLabel(value: string) {
  if (!value) return 'Selecione uma data'

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
}

function formatDuration(minutes?: number, formatted?: string | null) {
  if (formatted) return formatted
  if (!minutes) return '--'

  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

function getServiceDescription(description?: string | null) {
  return description?.trim() || 'Atendimento profissional'
}

function formatTimeRange(slot: string, durationMinutes?: number) {
  if (!slot) return 'Escolha um horário'
  if (!durationMinutes) return slot

  return `${slot} às ${addMinutesToTime(slot, durationMinutes).slice(0, 5)}`
}

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [professional, setProfessional] = useState<PublicProfessional | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState<'schedule' | 'details'>('schedule')
  const [selectedDate, setSelectedDate] = useState(getTodayValue())
  const [selectedSlot, setSelectedSlot] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfessional() {
      if (!slug) return

      try {
        setIsLoading(true)

        const response = await api.get<PublicProfessional>(
          `/api/public/professionals/${slug}`
        )

        if (isMounted) {
          setProfessional(response)
          setSelectedServiceId(null)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os dados do agendamento.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfessional()

    return () => {
      isMounted = false
    }
  }, [slug])

  useEffect(() => {
    let isMounted = true

    async function loadSlots() {
      if (!slug || !selectedServiceId || !selectedDate) {
        setSlots([])
        return
      }

      try {
        setIsLoadingSlots(true)
        setSelectedSlot('')

        const response = await api.get<PublicAvailableSlots>(
          `/api/public/professionals/${slug}/available-slots?serviceId=${selectedServiceId}&date=${selectedDate}`
        )

        if (isMounted) {
          setSlots(response.slots)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setSlots([])
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os horários disponíveis.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false)
        }
      }
    }

    loadSlots()

    return () => {
      isMounted = false
    }
  }, [slug, selectedServiceId, selectedDate])

  const selectedService = useMemo(
    () =>
      professional?.services.find((item) => Number(item.id) === selectedServiceId) ??
      null,
    [professional, selectedServiceId]
  )

  const selectedTimeLabel = formatTimeRange(
    selectedSlot,
    selectedService?.durationMinutes
  )

  const canSubmit =
    !!selectedService &&
    !!selectedDate &&
    !!selectedSlot &&
    !!fullName.trim() &&
    !!phone.trim() &&
    !!email.trim()

  function handleServiceSelect(serviceId: number) {
    setSelectedServiceId(serviceId)
    setSelectedSlot('')
    setBookingStep('schedule')
    setIsBookingModalOpen(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleCloseModal() {
    setIsBookingModalOpen(false)
    setBookingStep('schedule')
    setErrorMessage('')
  }

  function handleGoToDetails() {
    if (!selectedServiceId || !selectedService) {
      setErrorMessage('Selecione um servico.')
      return
    }

    if (!selectedDate) {
      setErrorMessage('Selecione uma data.')
      return
    }

    if (!selectedSlot) {
      setErrorMessage('Selecione um horario disponivel.')
      return
    }

    setErrorMessage('')
    setBookingStep('details')
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    if (!slug) return

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Preencha nome e telefone.')
      setSuccessMessage('')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Preencha o e-mail para receber a confirmação.')
      setSuccessMessage('')
      return
    }

    if (!selectedServiceId || !selectedService) {
      setErrorMessage('Selecione um serviço.')
      setSuccessMessage('')
      return
    }

    if (!selectedDate) {
      setErrorMessage('Selecione uma data.')
      setSuccessMessage('')
      return
    }

    if (!selectedSlot) {
      setErrorMessage('Selecione um horário disponível.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      const startTime = normalizeStartTime(selectedSlot)
      const endTime = addMinutesToTime(selectedSlot, selectedService.durationMinutes)

      const response = await api.post<PublicBookingResponse>(
        `/api/public/professionals/${slug}/appointments`,
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          serviceId: selectedServiceId,
          appointmentDate: selectedDate,
          startTime,
          endTime,
          notes: notes.trim() || null,
        }
      )

      navigate(`/agendar/${slug}/sucesso`, {
        state: response,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o agendamento.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="public-booking-shell">
        <div className="feedback-card">Carregando agenda...</div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="public-booking-shell">
        <div className="feedback-card error-box">
          {errorMessage || 'Agenda não encontrada.'}
        </div>
      </div>
    )
  }

  return (
    <div className="public-booking-shell">
      <div className="public-booking-container">
        <div className="public-booking-hero">
          <span className="public-booking-kicker">Agendamento online</span>
          <h1>{professional.displayName}</h1>
          <p>{professional.subtitle}</p>
        </div>

        {errorMessage && !isBookingModalOpen ? <div className="feedback-card error-box">{errorMessage}</div> : null}
        {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

        <PageCard className="public-booking-card">
          <div className="public-booking-choice-layout">
            <section className="public-booking-panel public-booking-services-panel">
              <div className="public-booking-step-heading">
                <span>1</span>
                <div>
                  <h2>Escolha seu servico</h2>
                  <p>Depois disso, abrimos uma jornada rapida para data, horario e seus dados.</p>
                </div>
              </div>

              <div className="public-service-options public-service-options-showcase">
                {professional.services.map((service) => {
                  const isSelected = Number(service.id) === selectedServiceId

                  return (
                    <button
                      key={service.id}
                      type="button"
                      className={`public-service-option public-service-choice-card ${isSelected ? 'selected' : ''}`.trim()}
                      onClick={() => handleServiceSelect(Number(service.id))}
                      aria-pressed={isSelected}
                    >
                      <span className="public-service-check">
                        {isSelected ? <CheckCircle2 size={19} /> : null}
                      </span>

                      <span className="public-service-copy">
                        <strong>{service.name}</strong>
                        <small>{getServiceDescription(service.description)}</small>
                      </span>

                      <span className="public-service-meta">
                        <span>{formatDuration(service.durationMinutes, service.durationFormatted)}</span>
                        <strong>{service.priceFormatted}</strong>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <aside className="public-booking-panel public-booking-path-card">
              <div className="public-booking-step-heading">
                <span>
                  <Clock3 size={18} />
                </span>
                <div>
                  <h2>Como funciona</h2>
                  <p>Voce escolhe o servico e finaliza tudo em poucos passos.</p>
                </div>
              </div>

              <div className="public-booking-path-list">
                <div>
                  <strong>Servico</strong>
                  <span>Compare duracao, valor e descricao.</span>
                </div>

                <div>
                  <strong>Agenda</strong>
                  <span>Escolha uma data e um horario disponivel.</span>
                </div>

                <div>
                  <strong>Confirmacao</strong>
                  <span>Informe seus dados para receber o comprovante.</span>
                </div>
              </div>
            </aside>
          </div>
        </PageCard>

        {isBookingModalOpen && selectedService ? (
          <div className="booking-modal-layer" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
            <button
              type="button"
              className="booking-modal-backdrop"
              onClick={handleCloseModal}
              aria-label="Fechar agendamento"
            />

            <form className="booking-modal" onSubmit={handleSubmit}>
              <div className="booking-modal-header">
                <div className="public-booking-step-heading">
                  <span>{bookingStep === 'schedule' ? '2' : '3'}</span>
                  <div>
                    <h2 id="booking-modal-title">
                      {bookingStep === 'schedule' ? 'Quando voce quer realizar?' : 'Seus dados'}
                    </h2>
                    <p>
                      {bookingStep === 'schedule'
                        ? 'Escolha a melhor data e um horario livre.'
                        : 'Falta pouco para confirmar seu agendamento.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="icon-button booking-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="booking-modal-progress">
                <span className="done">Servico</span>
                <span className={bookingStep === 'schedule' ? 'active' : 'done'}>Agenda</span>
                <span className={bookingStep === 'details' ? 'active' : ''}>Dados</span>
              </div>

              <div className="booking-modal-grid">
                <aside className="public-booking-panel public-booking-summary-card">
                  <div className="public-booking-summary-list">
                    <div>
                      <span>Servico</span>
                      <strong>{selectedService.name}</strong>
                    </div>

                    <div>
                      <span>Data</span>
                      <strong>{formatDateLabel(selectedDate)}</strong>
                    </div>

                    <div>
                      <span>Horario</span>
                      <strong>{selectedTimeLabel}</strong>
                    </div>

                    <div>
                      <span>Valor</span>
                      <strong>{selectedService.priceFormatted}</strong>
                    </div>
                  </div>
                </aside>

                <section className="booking-modal-step">
                  {bookingStep === 'schedule' ? (
                    <>
                      <label className="public-date-field" htmlFor="date">
                        <CalendarDays size={18} />
                        <input
                          id="date"
                          type="date"
                          value={selectedDate}
                          onChange={(event) => setSelectedDate(event.target.value)}
                        />
                      </label>

                      <div className="public-booking-slots">
                        {isLoadingSlots ? (
                          <div className="public-booking-empty">Carregando horarios...</div>
                        ) : slots.length === 0 ? (
                          <div className="public-booking-empty">
                            Nenhum horario disponivel para a data selecionada.
                          </div>
                        ) : (
                          <div className="public-booking-slot-grid">
                            {slots.map((slot) => {
                              const isSelected = selectedSlot === slot

                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  className={`public-slot-button ${isSelected ? 'selected' : ''}`.trim()}
                                  onClick={() => setSelectedSlot(slot)}
                                  aria-pressed={isSelected}
                                >
                                  {slot}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="public-booking-form">
                      <label className="public-input-field" htmlFor="fullName">
                        <User size={18} />
                        <input
                          id="fullName"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </label>

                      <label className="public-input-field" htmlFor="phone">
                        <Phone size={18} />
                        <input
                          id="phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="Telefone"
                          required
                        />
                      </label>

                      <label className="public-input-field" htmlFor="email">
                        <Mail size={18} />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="E-mail"
                          required
                        />
                      </label>

                      <textarea
                        className="public-notes-field"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Observacoes para o atendimento"
                      />
                    </div>
                  )}
                </section>
              </div>

              {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

              <div className="booking-modal-actions">
                {bookingStep === 'details' ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setBookingStep('schedule')}
                  >
                    <ArrowLeft size={18} />
                    Voltar
                  </button>
                ) : null}

                {bookingStep === 'schedule' ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleGoToDetails}
                    disabled={!selectedSlot}
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting || !canSubmit}
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  )
}
