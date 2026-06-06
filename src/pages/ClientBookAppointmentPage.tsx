import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { api } from '../utils/api'
import { getCurrentProfessionalUserId, getCurrentUserId } from '../utils/auth'
import { ROUTE_PATHS } from '../routes/routePaths'
import type { ServiceItem } from '../types/service.types'
import type { AvailableSlot } from '../types/public.types'
import type { Appointment } from '../types/appointment.types'

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

export default function ClientBookAppointmentPage() {
  const navigate = useNavigate()
  const professionalUserId = getCurrentProfessionalUserId()

  const [services, setServices] = useState<ServiceItem[]>([])
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState(getToday())
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      try {
        setIsLoading(true)
        const data = await api.get<ServiceItem[]>(`/api/public/professionals/${professionalUserId}/services`)
        if (isMounted) {
          setServices(data)
          if (data.length > 0) {
            setServiceId(String(data[0].id))
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os serviços.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadServices()
    return () => {
      isMounted = false
    }
  }, [professionalUserId])

  useEffect(() => {
    let isMounted = true

    async function loadSlots() {
      if (!serviceId || !date) {
        setSlots([])
        return
      }

      try {
        setIsLoadingSlots(true)
        const data = await api.get<AvailableSlot[]>(
          `/api/client/available-slots?userId=${getCurrentUserId()}&serviceId=${serviceId}&date=${date}`
        )
        if (isMounted) {
          setSlots(data)
          setSelectedTime(data[0]?.time ?? '')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os horários.')
          setSlots([])
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
  }, [serviceId, date])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!serviceId || !date || !selectedTime) {
      setErrorMessage('Selecione serviço, data e horário.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post<Appointment>(`/api/client/appointments?userId=${getCurrentUserId()}`, {
        professionalUserId,
        serviceId: Number(serviceId),
        date,
        time: selectedTime,
        notes: notes || null,
      })
      navigate(ROUTE_PATHS.clientAppointments)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar o agendamento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="feedback-card">Carregando formulário...</div>

  return (
    <div className="page-stack client-booking-page">
      <SectionHeader title="Agendar horário" description="Escolha o serviço, a data e um horário disponível." />

      <PageCard className="client-booking-card">
        <form className="page-stack client-booking-form" onSubmit={handleSubmit}>
          <div className="two-column-grid client-booking-controls">
            <div>
              <label className="label">Serviço</label>
              <select className="text-input" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.priceFormatted}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data</label>
              <input className="text-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Horários disponíveis</label>
            {isLoadingSlots ? (
              <div className="feedback-card">Carregando horários...</div>
            ) : slots.length === 0 ? (
              <div className="empty-state">Nenhum horário disponível para esta data.</div>
            ) : (
              <div className="slot-grid top-gap client-slot-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    className={`slot-button ${selectedTime === slot.time ? 'active' : ''}`.trim()}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea className="text-input" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ex.: prefiro confirmação pelo WhatsApp" />
          </div>

          {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

          <button className="primary-button client-booking-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </form>
      </PageCard>
    </div>
  )
}
