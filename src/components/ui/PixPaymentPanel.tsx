import { useEffect, useState } from 'react'
import { CheckCircle2, Clipboard, Clock3 } from 'lucide-react'
import { api } from '../../utils/api'
import type { PublicPaymentStatusResponse } from '../../types/public-booking.types'

type PixPaymentPanelProps = {
  paymentReference: string
  pixQrCode?: string | null
  pixQrCodeBase64?: string | null
  depositAmount?: number | null
  paymentExpiresAt?: string | null
  initialPaymentStatus?: string | null
  initialAppointmentStatus?: string | null
}

function isConfirmed(status?: string | null) {
  return status?.trim().toLowerCase() === 'confirmed'
}

function isExpired(status?: string | null) {
  const normalized = status?.trim().toLowerCase() ?? ''
  return normalized === 'expired' || normalized === 'cancelled' || normalized === 'canceled'
}

function formatAmount(amount?: number | null) {
  if (amount == null) return 'Consulte o valor informado no agendamento.'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

function formatExpiration(value?: string | null) {
  if (!value) return 'em até 30 minutos'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'em até 30 minutos'

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function getQrImageSource(value?: string | null) {
  if (!value) return ''
  return value.startsWith('data:image/') ? value : `data:image/png;base64,${value}`
}

export default function PixPaymentPanel({
  paymentReference,
  pixQrCode,
  pixQrCodeBase64,
  depositAmount,
  paymentExpiresAt,
  initialPaymentStatus,
  initialAppointmentStatus,
}: PixPaymentPanelProps) {
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus ?? 'pending')
  const [appointmentStatus, setAppointmentStatus] = useState(initialAppointmentStatus ?? '')
  const [amount, setAmount] = useState(depositAmount)
  const [expiresAt, setExpiresAt] = useState(paymentExpiresAt)
  const [pollError, setPollError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    let isActive = true
    let isChecking = false
    let intervalId = 0
    let isFinal =
      isConfirmed(initialAppointmentStatus) ||
      isExpired(initialPaymentStatus) ||
      isExpired(initialAppointmentStatus)

    async function refreshPaymentStatus() {
      if (isChecking || isFinal) return
      isChecking = true

      try {
        const status = await api.get<PublicPaymentStatusResponse>(
          `/api/public/payments/${encodeURIComponent(paymentReference)}`
        )

        if (isActive) {
          setPaymentStatus(status.status)
          setAppointmentStatus(status.appointmentStatus)
          setAmount(status.depositAmount)
          setExpiresAt(status.expiresAt)
          setPollError('')
          isFinal =
            isConfirmed(status.appointmentStatus) ||
            isExpired(status.status) ||
            isExpired(status.appointmentStatus)
          if (isFinal) window.clearInterval(intervalId)
        }
      } catch (error) {
        if (isActive) {
          setPollError(
            error instanceof Error
              ? error.message
              : 'Não foi possível consultar o status do pagamento.'
          )
        }
      } finally {
        isChecking = false
      }
    }

    if (!isFinal) {
      void refreshPaymentStatus()
      intervalId = window.setInterval(() => {
        void refreshPaymentStatus()
      }, 5000)

      return () => {
        isActive = false
        window.clearInterval(intervalId)
      }
    }

    return () => {
      isActive = false
    }
  }, [paymentReference, initialAppointmentStatus, initialPaymentStatus])

  async function copyPixCode() {
    if (!pixQrCode) return

    try {
      await navigator.clipboard.writeText(pixQrCode)
      setCopyMessage('Código Pix copiado.')
    } catch (error) {
      setCopyMessage(
        error instanceof Error
          ? `Não foi possível copiar o código Pix: ${error.message}`
          : 'Não foi possível copiar o código Pix. Selecione e copie o texto manualmente.'
      )
    }
  }

  const confirmed = isConfirmed(appointmentStatus)
  const expired = isExpired(paymentStatus) || isExpired(appointmentStatus)
  const qrImageSource = getQrImageSource(pixQrCodeBase64)

  return (
    <section className="pix-payment-panel" aria-live="polite">
      <div className={`pix-payment-status ${confirmed ? 'confirmed' : expired ? 'expired' : 'pending'}`}>
        {confirmed ? <CheckCircle2 size={20} /> : <Clock3 size={20} />}
        <div>
          <strong>
            {confirmed
              ? 'Pagamento confirmado'
              : expired
                ? 'Pagamento expirado'
                : 'Aguardando pagamento via Pix'}
          </strong>
          <span>
            {confirmed
              ? 'Seu agendamento está confirmado.'
              : expired
                ? 'A reserva foi cancelada e o horário liberado.'
                : 'Após o pagamento, confirmaremos seu agendamento automaticamente.'}
          </span>
        </div>
      </div>

      {!confirmed && !expired ? (
        <>
          <p className="pix-payment-amount">
            Valor do sinal: <strong>{formatAmount(amount)}</strong>
          </p>
          <p className="pix-payment-expiration">
            Pague até {formatExpiration(expiresAt)}. A reserva expira em até 30 minutos.
          </p>

          {qrImageSource ? (
            <img className="pix-payment-qr" src={qrImageSource} alt="QR Code para pagamento Pix" />
          ) : null}

          {pixQrCode ? (
            <div className="pix-payment-code">
              <label htmlFor={`pix-code-${paymentReference}`}>Pix copia e cola</label>
              <textarea
                id={`pix-code-${paymentReference}`}
                value={pixQrCode}
                readOnly
                rows={4}
                onFocus={(event) => event.currentTarget.select()}
              />
              <button type="button" className="secondary-button" onClick={copyPixCode}>
                <Clipboard size={16} />
                Copiar código Pix
              </button>
              {copyMessage ? <small>{copyMessage}</small> : null}
            </div>
          ) : null}
        </>
      ) : null}

      {pollError ? <p className="pix-payment-error">{pollError} A consulta será repetida automaticamente.</p> : null}
    </section>
  )
}
