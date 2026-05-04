import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'
import { ROUTE_PATHS } from '../routes/routePaths'
import type { LoginResponse } from '../types/auth.types'

type LoginMode = 'professional' | 'client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<LoginMode>('professional')
  const [email, setEmail] = useState(mode === 'professional' ? 'renan@email.com' : 'cliente@email.com')
  const [password, setPassword] = useState('123456')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode)
    setEmail(nextMode === 'professional' ? 'renan@email.com' : 'cliente@email.com')
    setPassword('123456')
    setErrorMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha e-mail e senha.')
      return
    }

    try {
      setIsSubmitting(true)
      const data = await api.post<LoginResponse>('/api/auth/login', { email, password })
      signIn(data)

      if (data.user.role === 'client') {
        navigate(ROUTE_PATHS.clientHome)
        return
      }

      navigate(ROUTE_PATHS.dashboard)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível fazer login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <section className="auth-brand-card">
          <p className="auth-eyebrow">Agenda Pro</p>
          <h1>Uma entrada para profissionais e clientes.</h1>
          <p className="auth-copy">
            Profissionais gerenciam agenda e clientes. Clientes conseguem visualizar horários disponíveis e marcar um atendimento.
          </p>

          <div className="auth-highlight-box">
            <strong>Credenciais de teste</strong>
            <span>Profissional: renan@email.com / 123456</span>
            <span>Cliente: cliente@email.com / 123456</span>
          </div>
        </section>

        <section className="auth-form-card">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${mode === 'professional' ? 'active' : ''}`.trim()} onClick={() => changeMode('professional')}>
              Profissional
            </button>
            <button type="button" className={`auth-tab ${mode === 'client' ? 'active' : ''}`.trim()} onClick={() => changeMode('client')}>
              Cliente
            </button>
          </div>

          <div className="card-heading auth-heading">
            <div>
              <h3>{mode === 'professional' ? 'Entrar como profissional' : 'Entrar como cliente'}</h3>
              <p>{mode === 'professional' ? 'Acesse o painel administrativo da agenda.' : 'Acesse seu portal para agendar e acompanhar horários.'}</p>
            </div>
          </div>

          <form className="page-stack" onSubmit={handleSubmit}>
            <div>
              <label className="label">E-mail</label>
              <input className="text-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Digite seu e-mail" />
            </div>

            <div>
              <label className="label">Senha</label>
              <input className="text-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" />
            </div>

            {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

            <button className="primary-button auth-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-links-stack">
            <Link to={ROUTE_PATHS.register}>{mode === 'professional' ? 'Criar conta profissional' : 'Criar conta profissional'}</Link>
            <Link to={ROUTE_PATHS.clientRegister}>Criar conta de cliente</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
