import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'

export default function CreateServicePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [price, setPrice] = useState('0')
  const [colorHex, setColorHex] = useState('#0f172a')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const duration = Number(durationMinutes)
    const servicePrice = Number(price)

    if (!name.trim()) {
      setErrorMessage('Informe o nome do serviço.')
      return
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setErrorMessage('A duração precisa ser maior que zero.')
      return
    }

    if (!Number.isFinite(servicePrice) || servicePrice < 0) {
      setErrorMessage('O valor precisa ser zero ou maior.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/api/services', {
        userId: getCurrentUserId(),
        name: name.trim(),
        description: description.trim() || null,
        durationMinutes: duration,
        price: servicePrice,
        colorHex: colorHex.trim() || null,
      })

      setSuccessMessage('Serviço cadastrado com sucesso.')
      setTimeout(() => navigate(ROUTE_PATHS.services), 700)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível cadastrar o serviço.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Novo serviço"
        description="Cadastre um serviço que poderá ser usado nos agendamentos."
        action={
          <Link to={ROUTE_PATHS.services} className="secondary-button">
            Voltar
          </Link>
        }
      />

      <PageCard>
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid two-columns">
            <div>
              <label className="label" htmlFor="service-name">Nome do serviço</label>
              <input id="service-name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Corte feminino" />
            </div>

            <div>
              <label className="label" htmlFor="service-duration">Duração (minutos)</label>
              <input id="service-duration" type="number" min="1" className="text-input" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </div>
          </div>

          <div className="form-grid two-columns">
            <div>
              <label className="label" htmlFor="service-price">Preço</label>
              <input id="service-price" type="number" min="0" step="0.01" className="text-input" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <div>
              <label className="label" htmlFor="service-color">Cor</label>
              <div className="color-field-wrap">
                <input id="service-color" type="color" className="color-input" value={colorHex} onChange={(e) => setColorHex(e.target.value)} />
                <input className="text-input" value={colorHex} onChange={(e) => setColorHex(e.target.value)} placeholder="#0f172a" />
              </div>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="service-description">Descrição</label>
            <textarea id="service-description" className="text-input textarea-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o serviço" />
          </div>

          {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
          {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

          <div className="section-actions">
            <Link to={ROUTE_PATHS.services} className="secondary-button">Cancelar</Link>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar serviço'}
            </button>
          </div>
        </form>
      </PageCard>
    </div>
  )
}
