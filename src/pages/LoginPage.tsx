import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'
import { ROUTE_PATHS } from '../routes/routePaths'
import type { LoginResponse } from '../types/auth.types'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('renan@email.com')
  const [password, setPassword] = useState('123456')
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
      const data = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      })

      signIn(data)
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
          <h1>Conecte seu front ao backend sem complicação.</h1>
          <p className="auth-copy">
            Faça login para acessar dashboard, clientes, serviços, disponibilidade, perfil e configurações integrados com a API .NET.
          </p>

          <div className="auth-highlight-box">
            <strong>Credencial de teste</strong>
            <span>E-mail: renan@email.com</span>
            <span>Senha: qualquer valor não vazio</span>
          </div>
        </section>

        <section className="auth-form-card">
          <div className="card-heading auth-heading">
            <div>
              <h3>Entrar</h3>
              <p>Use o usuário seedado no banco para começar.</p>
            </div>
          </div>

          <form className="page-stack" onSubmit={handleSubmit}>
            <div>
              <label className="label">E-mail</label>
              <input
                className="text-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                className="text-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
              />
            </div>

            {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

            <button className="primary-button auth-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
