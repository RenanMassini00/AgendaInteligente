import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MassiniBrand from '../components/branding/MassiniBrand'
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
    role: 'professional' | 'master_admin'
    phone?: string | null
    publicSlug?: string | null
    timezone?: string | null
    clientId?: number | null
    professionalUserId?: number | null
    hasAppointmentsModule: boolean
    hasCatalogModule: boolean
  }
}

function normalizeRole(role?: string | null) {
  const normalized = (role ?? '').trim().toLowerCase()
  return normalized === 'master_admin' || normalized === 'master admin'
    ? 'master_admin'
    : 'professional'
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

      const normalizedRole = normalizeRole(response.user.role)

      signIn({
        token: response.token,
        userId: response.user.id,
        role: normalizedRole,
        fullName: response.user.fullName,
        email: response.user.email,
        businessName: response.user.businessName ?? undefined,
        specialty: response.user.specialty ?? undefined,
        hasAppointmentsModule: response.user.hasAppointmentsModule,
        hasCatalogModule: response.user.hasCatalogModule,
      })

      if (normalizedRole === 'master_admin') {
        navigate(ROUTE_PATHS.adminDashboard, { replace: true })
      } else {
        navigate(ROUTE_PATHS.dashboard, { replace: true })
      }
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
    <div className="login-modern-shell massini-auth-shell">
      <div className="login-modern-grid">
        <div className="login-modern-hero">
          <div className="auth-brand-block">
            <MassiniBrand className="massini-brand--hero" />
          </div>

          <h1 className="login-modern-title">
            Soluções digitais para
            <span> agendamento, catálogo e gestão.</span>
          </h1>

          <p className="login-modern-description">
            Tecnologia que simplifica processos e prepara sua operação para crescer
            dentro do ecossistema Massini Labs.
          </p>

          <div className="login-modern-highlights">
            <div className="login-highlight-card">
              <strong>Agendamentos</strong>
              <span>Organize clientes, serviços, disponibilidade e compromissos.</span>
            </div>

            <div className="login-highlight-card">
              <strong>Catálogo</strong>
              <span>Venda produtos com visual moderno e direcionamento para WhatsApp.</span>
            </div>

            <div className="login-highlight-card">
              <strong>Expansão</strong>
              <span>Novos serviços poderão ser adicionados no mesmo ecossistema.</span>
            </div>
          </div>
        </div>

        <div className="login-modern-card massini-auth-card">
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
            <Link to={ROUTE_PATHS.register} className="login-modern-footer-link">
              Criar conta profissional
            </Link>

            <Link to={ROUTE_PATHS.catalogAccess} className="login-modern-footer-link">
              Acessar catálogo público
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}