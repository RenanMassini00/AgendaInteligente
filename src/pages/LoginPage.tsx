import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'

type LoginResponse = {
  token: string
  user: {
    id: number
    fullName: string
    email: string
    businessName?: string | null
    specialty?: string | null
    role: 'professional'
    phone?: string | null
    publicSlug?: string | null
    timezone?: string | null
    clientId?: number | null
    professionalUserId?: number | null
  }
}

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
        role: 'professional',
      })

      console.log('LOGIN RESPONSE', response)

      signIn({
        token: response.token,
        userId: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        businessName: response.user.businessName ?? undefined,
        specialty: response.user.specialty ?? undefined,
      })

      navigate(ROUTE_PATHS.dashboard, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o login.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-modern-shell">
      <div className="login-modern-grid">
        <div className="login-modern-hero">
          <div className="login-modern-badge">Agenda Pro</div>

          <h1 className="login-modern-title">
            Seu sistema de agendamento,
            <span> bonito, rápido e profissional.</span>
          </h1>

          <p className="login-modern-description">
            Organize clientes, serviços, horários e agendamentos em uma experiência
            moderna e simples de usar.
          </p>

          <div className="login-modern-highlights">
            <div className="login-highlight-card">
              <strong>Clientes</strong>
              <span>Cadastro rápido e histórico centralizado.</span>
            </div>

            <div className="login-highlight-card">
              <strong>Agendamentos</strong>
              <span>Visualização clara da agenda e horários livres.</span>
            </div>

            <div className="login-highlight-card">
              <strong>Disponibilidade</strong>
              <span>Recorrência semanal e datas específicas.</span>
            </div>
          </div>
        </div>

        <div className="login-modern-card">
          <div className="login-modern-card-header">
            <p className="login-modern-kicker">Entrar</p>
            <h2>Login profissional</h2>
            <span>Acesse seu painel administrativo.</span>
          </div>

          <form onSubmit={handleSubmit} className="login-modern-form">
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@empresa.com"
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
                placeholder="Digite sua senha"
              />
            </div>

            {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

            <button
              type="submit"
              className="primary-button login-modern-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-modern-footer">
            <Link to={ROUTE_PATHS.register}>Criar conta profissional</Link>
          </div>
        </div>
      </div>
    </div>
  )
}