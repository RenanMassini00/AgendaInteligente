import { Link, useLocation, useParams } from 'react-router-dom'
import type { PublicBookingResponse } from '../types/public-booking.types'

export default function PublicBookingSuccessPage() {
  const location = useLocation()
  const { slug } = useParams()

  const bookingData = location.state as PublicBookingResponse | null

  if (!bookingData) {
    return (
      <div className="public-success-shell">
        <div className="public-success-card">
          <div className="public-success-badge">Concluído</div>
          <h1>Agendamento realizado</h1>
          <p>Seu agendamento foi registrado com sucesso.</p>

          <div className="public-success-actions">
            <Link to={`/agendar/${slug}`} className="primary-button">
              Voltar para agenda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-success-shell">
      <div className="public-success-card">
        <div className="public-success-badge">Tudo certo</div>

        <h1>Agendamento realizado com sucesso</h1>

        <p className="public-success-description">
          Seu horário foi reservado. Abaixo estão os detalhes do agendamento e o
          status das confirmações automáticas.
        </p>

        <div className="public-success-summary">
          <div className="public-success-summary-item">
            <span>Cliente</span>
            <strong>{bookingData.clientName}</strong>
          </div>

          <div className="public-success-summary-item">
            <span>Serviço</span>
            <strong>{bookingData.serviceName}</strong>
          </div>

          <div className="public-success-summary-item">
            <span>Data</span>
            <strong>{bookingData.date}</strong>
          </div>

          <div className="public-success-summary-item">
            <span>Horário</span>
            <strong>
              {bookingData.startTime} às {bookingData.endTime}
            </strong>
          </div>

          <div className="public-success-summary-item">
            <span>Profissional</span>
            <strong>
              {bookingData.businessName || bookingData.professionalName}
            </strong>
          </div>
        </div>

        <div className="public-success-status-list">
          <div
            className={`public-success-status-card ${
              bookingData.clientEmailSent ? 'success' : 'neutral'
            }`}
          >
            <strong>E-mail do cliente</strong>
            <span>
              {bookingData.clientEmailSent
                ? 'Confirmação enviada com sucesso.'
                : 'Não foi possível enviar o e-mail para o cliente.'}
            </span>
          </div>

          <div
            className={`public-success-status-card ${
              bookingData.professionalEmailSent ? 'success' : 'neutral'
            }`}
          >
            <strong>E-mail do profissional</strong>
            <span>
              {bookingData.professionalEmailSent
                ? 'Notificação enviada com sucesso.'
                : 'Não foi possível enviar o e-mail para o profissional.'}
            </span>
          </div>

          <div
            className={`public-success-status-card ${
              bookingData.calendarCreated ? 'success' : 'neutral'
            }`}
          >
            <strong>Google Agenda</strong>
            <span>
              {bookingData.calendarCreated
                ? 'Evento criado com sucesso.'
                : 'Não foi possível criar o evento na agenda.'}
            </span>
          </div>
        </div>

        <div className="public-success-actions">
          <Link to={`/agendar/${slug}`} className="secondary-button">
            Fazer outro agendamento
          </Link>
        </div>
      </div>
    </div>
  )
}