import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>()

  const [professional, setProfessional] = useState<PublicProfessional | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(getTodayValue())
  const [selectedSlot, setSelectedSlot] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
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
        const response = await api.get<PublicProfessional>(`/api/public/professionals/${slug}`)

        if (isMounted) {
          setProfessional(response)
          setSelectedServiceId(response.services[0]?.id ?? null)
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
    () => professional?.services.find((item) => item.id === selectedServiceId) ?? null,
    [professional, selectedServiceId]
  )

  async function handleSubmit() {
    if (!slug) return

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Preencha nome e telefone.')
      setSuccessMessage('')
      return
    }

    if (!selectedServiceId) {
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

      const response = await api.post<PublicBookingResponse>(
        `/api/public/professionals/${slug}/book`,
        {
          fullName,
          phone,
          serviceId: selectedServiceId,
          date: selectedDate,
          time: selectedSlot,
        }
      )

      setSuccessMessage(response.message || 'Agendamento realizado com sucesso.')
      setSelectedSlot('')
      setFullName('')
      setPhone('')

      const slotsResponse = await api.get<PublicAvailableSlots>(
        `/api/public/professionals/${slug}/available-slots?serviceId=${selectedServiceId}&date=${selectedDate}`
      )

      setSlots(slotsResponse.slots)
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
    return <div className="public-booking-shell"><div className="feedback-card">Carregando agenda...</div></div>
  }

  if (!professional) {
    return <div className="public-booking-shell"><div className="feedback-card error-box">{errorMessage || 'Agenda não encontrada.'}</div></div>
  }

  return (
    <div className="public-booking-shell">
      <div className="public-booking-container">
        <div className="public-booking-hero">
          <span className="public-booking-kicker">Agendamento online</span>
          <h1>{professional.displayName}</h1>
          <p>{professional.subtitle}</p>
        </div>

        {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
        {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

        <PageCard className="public-booking-card">
          <div className="public-booking-grid">
            <div className="public-booking-form">
              <div className="form-field">
                <label htmlFor="serviceId">Serviço</label>
                <select
                  id="serviceId"
                  className="form-input"
                  value={selectedServiceId ?? ''}
                  onChange={(event) => setSelectedServiceId(Number(event.target.value))}
                >
                  {professional.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.priceFormatted}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="date">Data</label>
                <input
                  id="date"
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="fullName">Nome</label>
                <input
                  id="fullName"
                  className="form-input"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  className="form-input"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Digite seu telefone"
                />
              </div>
            </div>

            <div className="public-booking-summary">
              <div className="public-booking-service-card">
                <h3>{selectedService?.name ?? 'Selecione um serviço'}</h3>
                <p>{selectedService?.description || 'Escolha um serviço para ver os horários disponíveis.'}</p>

                {selectedService ? (
                  <div className="public-booking-meta">
                    <span className="soft-pill">{selectedService.duration}</span>
                    <span className="soft-pill">{selectedService.priceFormatted}</span>
                  </div>
                ) : null}
              </div>

              <div className="public-booking-slots">
                <h3>Horários disponíveis</h3>

                {isLoadingSlots ? (
                  <div className="empty-state">Carregando horários...</div>
                ) : slots.length === 0 ? (
                  <div className="empty-state">Nenhum horário disponível nessa data.</div>
                ) : (
                  <div className="public-booking-slot-grid">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`public-slot-button ${selectedSlot === slot ? 'selected' : ''}`.trim()}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="primary-button public-booking-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar agendamento'}
              </button>
            </div>
          </div>
        </PageCard>
      </div>
    </div>
  )
}