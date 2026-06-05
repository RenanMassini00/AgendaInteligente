import { FormEvent, useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

const systemCards = [
  {
    title: 'Agenda online',
    description: 'Controle horários, disponibilidade, serviços e confirmações em um só painel.',
    Icon: CalendarCheck,
  },
  {
    title: 'Catálogo digital',
    description: 'Publique produtos, destaque ofertas e direcione pedidos para o WhatsApp.',
    Icon: ShoppingBag,
  },
  {
    title: 'Clientes e serviços',
    description: 'Centralize cadastros, histórico de atendimento e dados essenciais da operação.',
    Icon: Users,
  },
  {
    title: 'Financeiro',
    description: 'Acompanhe indicadores, recebimentos e a saúde do negócio com mais clareza.',
    Icon: BarChart3,
  },
]

const flowItems = ['Clientes', 'Agenda', 'Catálogo', 'Resultados']

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoginModalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsLoginModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoginModalOpen])

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

  function openLoginModal() {
    setErrorMessage('')
    setIsLoginModalOpen(true)
  }

  return (
    <div className="login-modern-shell app-entry-shell">
      <main className="app-entry">
        <section className="app-entry-hero" aria-labelledby="app-entry-title">
          <span className="app-entry-eyebrow">Plataforma integrada</span>

          <h1 id="app-entry-title" className="app-entry-title">
            Tudo para atender, vender e administrar em uma tela.
          </h1>

          <p className="app-entry-description">
            Uma central de trabalho para organizar agenda, clientes, serviços,
            catálogo online e indicadores financeiros com uma experiência simples
            para quem usa todos os dias.
          </p>

          <div className="app-entry-actions">
            <button type="button" className="primary-button app-entry-access" onClick={openLoginModal}>
              <span>Acessar</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="app-entry-systems" aria-label="Sistemas disponíveis">
            {systemCards.map(({ title, description, Icon }) => (
              <article className="app-entry-system-card" key={title}>
                <span className="app-entry-system-icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <strong>{title}</strong>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-entry-showcase" aria-label="Visão geral dos sistemas">
          <div className="app-entry-console">
            <div className="app-entry-console-top">
              <span>Operação</span>
              <strong>Fluxo integrado</strong>
            </div>

            <div className="app-entry-flow">
              {flowItems.map((item, index) => (
                <div className="app-entry-flow-step" key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>

            <div className="app-entry-console-screen">
              <div className="app-entry-screen-header">
                <span>Hoje</span>
                <strong>Visão operacional</strong>
              </div>

              <div className="app-entry-screen-grid">
                <div className="app-entry-screen-stat">
                  <CalendarCheck size={18} aria-hidden="true" />
                  <span>Agenda</span>
                  <strong>12 horários</strong>
                </div>
                <div className="app-entry-screen-stat">
                  <ShoppingBag size={18} aria-hidden="true" />
                  <span>Catálogo</span>
                  <strong>38 produtos</strong>
                </div>
                <div className="app-entry-screen-stat">
                  <Users size={18} aria-hidden="true" />
                  <span>Clientes</span>
                  <strong>Base ativa</strong>
                </div>
                <div className="app-entry-screen-stat">
                  <ClipboardList size={18} aria-hidden="true" />
                  <span>Serviços</span>
                  <strong>Controle total</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isLoginModalOpen ? (
        <div
          className="login-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              setIsLoginModalOpen(false)
            }
          }}
        >
          <section
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
          >
            <button
              type="button"
              className="login-modal-close"
              aria-label="Fechar login"
              onClick={() => setIsLoginModalOpen(false)}
              disabled={isSubmitting}
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="login-modal-header">
              <p className="login-modern-kicker">Entrar</p>
              <h2 id="login-modal-title">Acesse sua conta</h2>
              <span>Informe seus dados para abrir o painel administrativo.</span>
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
                  autoComplete="email"
                  autoFocus
                  required
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
                  autoComplete="current-password"
                  required
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
          </section>
        </div>
      ) : null}
    </div>
  )
}
