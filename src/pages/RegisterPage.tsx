import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'
import type { LoginResponse } from '../types/auth.types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    specialty: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage('Nome, e-mail e senha são obrigatórios.')
      return
    }

    try {
      setIsSubmitting(true)
      const data = await api.post<LoginResponse>('/api/auth/register-professional', form)
      signIn(data)
      navigate(ROUTE_PATHS.dashboard)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a conta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-single-panel">
        <section className="auth-form-card auth-wide-card">
          <div className="card-heading auth-heading">
            <div>
              <h3>Criar conta profissional</h3>
              <p>Cadastre seu negócio e comece a usar a agenda.</p>
            </div>
          </div>

          <form className="page-stack" onSubmit={handleSubmit}>
            <div className="two-column-grid">
              <div>
                <label className="label">Nome completo</label>
                <input className="text-input" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
              </div>
              <div>
                <label className="label">Nome da empresa</label>
                <input className="text-input" value={form.businessName} onChange={(event) => updateField('businessName', event.target.value)} />
              </div>
            </div>

            <div className="two-column-grid">
              <div>
                <label className="label">E-mail</label>
                <input className="text-input" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="text-input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </div>
            </div>

            <div className="two-column-grid">
              <div>
                <label className="label">Especialidade</label>
                <input className="text-input" value={form.specialty} onChange={(event) => updateField('specialty', event.target.value)} />
              </div>
              <div>
                <label className="label">Senha</label>
                <input className="text-input" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
              </div>
            </div>

            {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

            <button className="primary-button auth-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-links-stack">
            <Link to={ROUTE_PATHS.login}>Já tenho conta</Link>
            <Link to={ROUTE_PATHS.clientRegister}>Sou cliente e quero me cadastrar</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
