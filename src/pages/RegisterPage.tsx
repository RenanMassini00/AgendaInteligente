import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  Package2,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'

type RegisterResponse = {
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

  const [hasAppointmentsModule, setHasAppointmentsModule] = useState(true)
  const [hasCatalogModule, setHasCatalogModule] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedModulesLabel = useMemo(() => {
    if (hasAppointmentsModule && hasCatalogModule) return 'Agenda + Marketplace'
    if (hasAppointmentsModule) return 'Sistema de agendamentos'
    if (hasCatalogModule) return 'Marketplace / catálogo'
    return 'Nenhum módulo selecionado'
  }, [hasAppointmentsModule, hasCatalogModule])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasAppointmentsModule && !hasCatalogModule) {
      setErrorMessage('Selecione pelo menos um módulo: agendamentos ou catálogo.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await api.post<RegisterResponse>('/api/auth/register-professional', {
        fullName,
        businessName: businessName || null,
        email,
        phone: phone || null,
        specialty: specialty || null,
        timezone: timezone || null,
        publicSlug: publicSlug || null,
        password,
        hasAppointmentsModule,
        hasCatalogModule,
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

      navigate(ROUTE_PATHS.dashboard, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o cadastro.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-shell">
      <div className="register-backdrop" />

      <div className="register-layout">
        <section className="register-hero">
          <div className="register-hero-badge">Agenda Pro</div>

          <div className="register-hero-copy">
            <h1>Crie sua conta profissional</h1>
            <p>
              Escolha o formato ideal para o seu negócio e comece com uma experiência
              bonita, simples e profissional.
            </p>
          </div>

          <div className="register-hero-grid">
            <article className="register-feature-card">
              <div className="register-feature-icon">
                <CalendarDays size={20} />
              </div>
              <div>
                <strong>Agenda inteligente</strong>
                <span>Clientes, serviços, disponibilidade e agendamentos em um só lugar.</span>
              </div>
            </article>

            <article className="register-feature-card">
              <div className="register-feature-icon">
                <Store size={20} />
              </div>
              <div>
                <strong>Catálogo online</strong>
                <span>Venda produtos com visual moderno e direcionamento para WhatsApp.</span>
              </div>
            </article>

            <article className="register-feature-card">
              <div className="register-feature-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong>Controle flexível</strong>
                <span>O admin pode liberar ou ajustar os módulos depois do cadastro.</span>
              </div>
            </article>
          </div>

          <div className="register-hero-highlight">
            <div className="register-hero-highlight-top">
              <span className="register-hero-highlight-label">Configuração escolhida</span>
              <strong>{selectedModulesLabel}</strong>
            </div>

            <div className="register-selected-modules">
              <span className={`register-selected-chip ${hasAppointmentsModule ? 'active' : ''}`}>
                <CalendarDays size={14} />
                Agendamentos
              </span>

              <span className={`register-selected-chip ${hasCatalogModule ? 'active' : ''}`}>
                <Package2 size={14} />
                Marketplace
              </span>
            </div>
          </div>
        </section>

        <section className="register-form-panel">
          <div className="register-form-card">
            <div className="register-form-header">
              <span className="register-form-kicker">Cadastro</span>
              <h2>Novo acesso profissional</h2>
              <p>Preencha seus dados e escolha o tipo de sistema que deseja utilizar.</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-form-grid">
                <div className="form-field">
                  <label htmlFor="fullName">Nome completo</label>
                  <input
                    id="fullName"
                    className="form-input"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="businessName">Nome da empresa</label>
                  <input
                    id="businessName"
                    className="form-input"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Nome do seu negócio"
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
                    placeholder="seuemail@empresa.com"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Telefone</label>
                  <input
                    id="phone"
                    className="form-input"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="specialty">Especialidade</label>
                  <input
                    id="specialty"
                    className="form-input"
                    value={specialty}
                    onChange={(event) => setSpecialty(event.target.value)}
                    placeholder="Ex: Manicure, loja, estética..."
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
                    placeholder="ex: meu-negocio"
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
              </div>

              <div className="register-module-section">
                <div className="register-module-section-header">
                  <h3>Escolha os módulos do sistema</h3>
                  <p>Você pode começar com um modelo e expandir depois.</p>
                </div>

                <div className="register-module-grid">
                  <button
                    type="button"
                    className={`register-module-card ${hasAppointmentsModule ? 'active' : ''}`}
                    onClick={() => setHasAppointmentsModule((current) => !current)}
                  >
                    <div className="register-module-card-top">
                      <div className="register-module-icon">
                        <CalendarDays size={20} />
                      </div>

                      <div className="register-module-check">
                        {hasAppointmentsModule ? <CheckCircle2 size={20} /> : null}
                      </div>
                    </div>

                    <div className="register-module-content">
                      <strong>Sistema de agendamentos</strong>
                      <p>Agenda, clientes, serviços, disponibilidade e organização do dia.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`register-module-card ${hasCatalogModule ? 'active' : ''}`}
                    onClick={() => setHasCatalogModule((current) => !current)}
                  >
                    <div className="register-module-card-top">
                      <div className="register-module-icon">
                        <Store size={20} />
                      </div>

                      <div className="register-module-check">
                        {hasCatalogModule ? <CheckCircle2 size={20} /> : null}
                      </div>
                    </div>

                    <div className="register-module-content">
                      <strong>Marketplace / catálogo</strong>
                      <p>Cadastre produtos, exiba no catálogo público e direcione para o WhatsApp.</p>
                    </div>
                  </button>
                </div>
              </div>

              {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

              <div className="register-form-actions">
                <button
                  type="submit"
                  className="primary-button register-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </button>

                <button
                  type="button"
                  className="secondary-button register-back-button"
                  onClick={() => navigate(ROUTE_PATHS.login)}
                >
                  Voltar para login
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}