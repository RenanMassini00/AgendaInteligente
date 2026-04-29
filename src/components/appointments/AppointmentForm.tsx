import { useMemo, useState } from 'react'
import { clientsMock } from '../../mocks/clientsMock'
import { servicesMock } from '../../mocks/servicesMock'
import type { Appointment, AppointmentStatus } from '../../types/appointment.types'

type AppointmentFormSubmit = Appointment & {
  notes?: string
}

type AppointmentFormProps = {
  onSubmit: (data: AppointmentFormSubmit) => void
}

type FormState = {
  clientId: string
  serviceId: string
  date: string
  time: string
  status: AppointmentStatus
  notes: string
}

function parsePrice(value: string) {
  return Number(
    value
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  )
}

export default function AppointmentForm({ onSubmit }: AppointmentFormProps) {
  const [form, setForm] = useState<FormState>({
    clientId: '',
    serviceId: '',
    date: '',
    time: '',
    status: 'scheduled',
    notes: '',
  })

  const selectedClient = useMemo(
    () => clientsMock.find((client) => client.id === form.clientId),
    [form.clientId]
  )

  const selectedService = useMemo(
    () => servicesMock.find((service) => service.id === form.serviceId),
    [form.serviceId]
  )

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.clientId || !form.serviceId || !form.date || !form.time) {
      alert('Preencha cliente, serviço, data e horário.')
      return
    }

    if (!selectedClient || !selectedService) {
      alert('Cliente ou serviço inválido.')
      return
    }

    onSubmit({
      id: crypto.randomUUID(),
      clientName: selectedClient.name,
      serviceName: selectedService.name,
      date: form.date,
      time: form.time,
      status: form.status,
      price: parsePrice(selectedService.price),
      notes: form.notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="page-stack">
      <div className="form-grid two-cols">
        <div className="form-field">
          <label htmlFor="clientId">Cliente</label>
          <select
            id="clientId"
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Selecione um cliente</option>
            {clientsMock.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="serviceId">Serviço</label>
          <select
            id="serviceId"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Selecione um serviço</option>
            {servicesMock.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid three-cols">
        <div className="form-field">
          <label htmlFor="date">Data</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="time">Horário</label>
          <input
            id="time"
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="form-input"
          >
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {selectedService && (
        <div className="form-summary">
          <div className="soft-pill">Serviço: {selectedService.name}</div>
          <div className="soft-pill">Duração: {selectedService.duration}</div>
          <div className="soft-pill">Valor: {selectedService.price}</div>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="notes">Observações</label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="form-input form-textarea"
          placeholder="Ex.: cliente pediu confirmação por WhatsApp"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button">
          Cancelar
        </button>

        <button type="submit" className="primary-button">
          Salvar agendamento
        </button>
      </div>
    </form>
  )
}