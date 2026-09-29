import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api'
import { getCurrentRole, getCurrentUserId } from '../../utils/auth'
import type { AppointmentCreateRequest, AppointmentStatus } from '../../types/appointment.types'
import type { Client } from '../../types/client.types'
import type { ServiceItem } from '../../types/service.types'

type AppointmentFormProps = {
  onSubmitSuccess: () => void
  appointmentId?: number
}

type AppointmentDetails = {
  clientId: number
  serviceId: number
  date?: string
  appointmentDate?: string
  time?: string
  startTime?: string
  status: AppointmentStatus
  notes?: string | null
}

type FormState = {
  clientId: string
  serviceId: string
  date: string
  time: string
  status: AppointmentStatus
  notes: string
}

export default function AppointmentForm({
  onSubmitSuccess,
  appointmentId,
}: AppointmentFormProps) {
  const isEmployee = getCurrentRole() === 'employee'
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [form, setForm] = useState<FormState>({
    clientId: '',
    serviceId: '',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    status: 'scheduled',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDependencies() {
      try {
        setIsLoading(true)
        const [clientsResponse, servicesResponse, appointmentResponse] = await Promise.all([
          api.get<Client[]>(isEmployee ? '/api/clients' : `/api/clients?userId=${getCurrentUserId()}`),
          api.get<ServiceItem[]>(isEmployee ? '/api/services' : `/api/services?userId=${getCurrentUserId()}`),
          appointmentId
            ? api.get<AppointmentDetails>(`/api/appointments/${appointmentId}`)
            : Promise.resolve(null),
        ])

        if (isMounted) {
          setClients(clientsResponse)
          setServices(servicesResponse)
          if (appointmentResponse) {
            setForm({
              clientId: String(appointmentResponse.clientId),
              serviceId: String(appointmentResponse.serviceId),
              date: (appointmentResponse.date || appointmentResponse.appointmentDate || '').slice(0, 10),
              time: (appointmentResponse.time || appointmentResponse.startTime || '09:00').slice(0, 5),
              status: appointmentResponse.status,
              notes: appointmentResponse.notes ?? '',
            })
          }
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os dados do formulário.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDependencies()
    return () => {
      isMounted = false
    }
  }, [appointmentId, isEmployee])

  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.serviceId)),
    [form.serviceId, services]
  )

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!form.clientId || !form.serviceId || !form.date || !form.time) {
      setErrorMessage('Preencha cliente, serviço, data e horário.')
      return
    }

    try {
      setIsSaving(true)
      const payload: AppointmentCreateRequest = {
        userId: getCurrentUserId(),
        clientId: Number(form.clientId),
        serviceId: Number(form.serviceId),
        date: form.date,
        time: form.time,
        status: form.status,
        notes: form.notes || undefined,
      }

      if (appointmentId) {
        await api.put(`/api/appointments/${appointmentId}`, payload)
      } else {
        await api.post('/api/appointments', payload)
      }
      onSubmitSuccess()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o agendamento.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="feedback-card">Carregando formulário...</div>
  }

  return (
    <form className="page-stack appointment-form" onSubmit={handleSubmit}>
      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}

      <div className="form-grid two-columns">
        <div>
          <label className="label">Cliente</label>
          <select className="text-input" name="clientId" value={form.clientId} onChange={handleChange}>
            <option value="">Selecione</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.fullName || client.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Serviço</label>
          <select className="text-input" name="serviceId" value={form.serviceId} onChange={handleChange}>
            <option value="">Selecione</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid three-columns">
        <div>
          <label className="label">Data</label>
          <input className="text-input" type="date" name="date" value={form.date} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Horário</label>
          <input className="text-input" type="time" name="time" value={form.time} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="text-input" name="status" value={form.status} onChange={handleChange}>
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {selectedService ? (
        <div className="soft-panel appointment-service-summary">
          <strong>{selectedService.name}</strong>
          <p className="muted-text">Duração: {selectedService.duration}</p>
          <p className="muted-text">Valor: {selectedService.priceFormatted}</p>
        </div>
      ) : null}

      <div>
        <label className="label">Observações</label>
        <textarea className="text-input textarea-input" name="notes" value={form.notes} onChange={handleChange} />
      </div>

      <div className="section-actions appointment-form-actions">
        <button className="primary-button" type="submit" disabled={isSaving}>
          {isSaving
            ? 'Salvando...'
            : appointmentId
              ? 'Atualizar agendamento'
              : 'Salvar agendamento'}
        </button>
      </div>
    </form>
  )
}
