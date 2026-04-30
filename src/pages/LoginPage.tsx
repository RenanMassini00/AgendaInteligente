import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { signIn } from '../utils/auth'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha e-mail e senha.')
      return
    }

    try {
      setIsSubmitting(true)

      await new Promise((resolve) => setTimeout(resolve, 600))

      signIn(email)
      navigate(ROUTE_PATHS.dashboard)
    } catch {
      setErrorMessage('Não foi possível realizar o login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">
          <p className="auth-kicker">Sistema de agendamento</p>
          <h1>Bem-vindo de volta</h1>
          <p className="auth-description">
            Acesse sua conta para gerenciar clientes, serviços e compromissos.
          </p>

          <div className="auth-preview-card">
            <div className="auth-preview-row">
              <strong>Agenda inteligente</strong>
              <span>Online</span>
            </div>

            <div className="auth-preview-list">
              <div className="auth-preview-item">
                <span className="preview-time">09:00</span>
                <div>
                  <strong>Mariana Costa</strong>
                  <p>Corte feminino</p>
                </div>
              </div>

              <div className="auth-preview-item">
                <span className="preview-time">10:30</span>
                <div>
                  <strong>Lucas Ferreira</strong>
                  <p>Treino funcional</p>
                </div>
              </div>

              <div className="auth-preview-item">
                <span className="preview-time">14:00</span>
                <div>
                  <strong>Patrícia Lima</strong>
                  <p>Manicure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <p className="auth-card-kicker">Entrar</p>
            <h2>Login</h2>
            <span>Use seu e-mail e senha para acessar o sistema.</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                className="form-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {errorMessage && <div className="auth-error">{errorMessage}</div>}

            <button type="submit" className="primary-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Ambiente inicial de desenvolvimento.</p>
            <span>Depois você conecta esse login ao backend.</span>
          </div>
        </div>
      </div>
    </div>
  )
}