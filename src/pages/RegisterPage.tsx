import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'

type RegisterResponse = {
  token: string
  userId: number
  fullName: string
  email: string
  businessName?: string
  specialty?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [publicSlug, setPublicSlug] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await api.post<RegisterResponse>('/api/auth/register-professional', {
        fullName,
        businessName,
        email,
        phone,
        specialty,
        timezone,
        publicSlug,
        password,
      })

      signIn({
        token: response.token,
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        businessName: response.businessName,
        specialty: response.specialty,
      })

      navigate(ROUTE_PATHS.dashboard)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">
          <p className="auth-kicker">Agenda Pro</p>
          <h1>Crie sua conta profissional</h1>
          <p className="auth-description">
            Configure sua agenda, serviços, clientes e disponibilidade em um só lugar.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <p className="auth-card-kicker">Cadastro</p>
            <h2>Novo acesso profissional</h2>
            <span>Preencha seus dados para começar.</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="fullName">Nome completo</label>
              <input
                id="fullName"
                className="form-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="businessName">Nome da empresa</label>
              <input
                id="businessName"
                className="form-input"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Telefone</label>
              <input
                id="phone"
                className="form-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="specialty">Especialidade</label>
              <input
                id="specialty"
                className="form-input"
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="timezone">Timezone</label>
              <input
                id="timezone"
                className="form-input"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="publicSlug">Slug público</label>
              <input
                id="publicSlug"
                className="form-input"
                value={publicSlug}
                onChange={(event) => setPublicSlug(event.target.value)}
                placeholder="ex: meu-agendamento"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

            <button type="submit" className="primary-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to={ROUTE_PATHS.login}>Já tenho conta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}