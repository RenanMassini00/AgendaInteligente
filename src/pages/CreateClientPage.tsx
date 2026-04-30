import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { ROUTE_PATHS } from '../routes/routePaths'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'

export default function CreateClientPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Preencha pelo menos nome e telefone.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/api/clients', {
        userId: getCurrentUserId(),
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim(),
        birthDate: birthDate || null,
        notes: notes.trim() || null,
      })

      setSuccessMessage('Cliente cadastrado com sucesso.')
      setTimeout(() => navigate(ROUTE_PATHS.clients), 700)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível cadastrar o cliente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Novo cliente"
        description="Cadastre um novo cliente para realizar agendamentos no sistema."
        action={
          <Link to={ROUTE_PATHS.clients} className="secondary-button">
            Voltar
          </Link>
        }
      />

      <PageCard>
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid two-columns">
            <div>
              <label className="label" htmlFor="client-name">Nome</label>
              <input id="client-name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite o nome do cliente" />
            </div>

            <div>
              <label className="label" htmlFor="client-phone">Telefone</label>
              <input id="client-phone" className="text-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Digite o telefone" />
            </div>
          </div>

          <div className="form-grid two-columns">
            <div>
              <label className="label" htmlFor="client-email">E-mail</label>
              <input id="client-email" type="email" className="text-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite o e-mail" />
            </div>

            <div>
              <label className="label" htmlFor="client-birth-date">Data de nascimento</label>
              <input id="client-birth-date" type="date" className="text-input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="client-notes">Observações</label>
            <textarea id="client-notes" className="text-input textarea-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre o cliente" />
          </div>

          {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
          {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

          <div className="section-actions">
            <Link to={ROUTE_PATHS.clients} className="secondary-button">Cancelar</Link>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar cliente'}
            </button>
          </div>
        </form>
      </PageCard>
    </div>
  )
}
