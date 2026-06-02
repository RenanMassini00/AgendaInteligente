import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { api } from '../utils/api'
import { signIn } from '../utils/auth'
import type { LoginResponse } from '../types/auth.types'
import type { PublicProfessional } from '../types/public.types'

export default function ClientRegisterPage() {
  const navigate = useNavigate()
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([])
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true)
  const [form, setForm] = useState({
    professionalUserId: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    birthDate: '',
    notes: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProfessionals() {
      try {
        const data = await api.get<PublicProfessional[]>('/api/public/professionals')
        if (isMounted) {
          setProfessionals(data)
          if (data.length > 0) {
            setForm((current) => ({ ...current, professionalUserId: String(data[0].id) }))
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os profissionais.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfessionals(false)
        }
      }
    }

    loadProfessionals()
    return () => {
      isMounted = false
    }
  }, [])

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!form.professionalUserId || !form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      setErrorMessage('Profissional, nome, e-mail, telefone e senha são obrigatórios.')
      return
    }

    try {
      setIsSubmitting(true)
      const data = await api.post<LoginResponse>('/api/auth/register-client', {
        professionalUserId: Number(form.professionalUserId),
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        birthDate: form.birthDate || null,
        notes: form.notes || null,
      })

      signIn({
        token: data.token,
        userId: data.user.id,
        role: 'client',
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone ?? null,
        professionalUserId: data.user.professionalUserId ?? Number(form.professionalUserId),
        clientId: data.user.clientId ?? null,
        hasAppointmentsModule: false,
        hasCatalogModule: false,
      })
      navigate(ROUTE_PATHS.clientHome)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a conta do cliente.')
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
              <h3>Criar conta de cliente</h3>
              <p>Escolha o profissional, cadastre seus dados e marque seus horários.</p>
            </div>
          </div>

          <form className="page-stack" onSubmit={handleSubmit}>
            <div>
              <label className="label">Profissional</label>
              <select className="text-input" value={form.professionalUserId} onChange={(event) => updateField('professionalUserId', event.target.value)} disabled={isLoadingProfessionals}>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.businessName || professional.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="two-column-grid">
              <div>
                <label className="label">Nome completo</label>
                <input className="text-input" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="text-input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </div>
            </div>

            <div className="two-column-grid">
              <div>
                <label className="label">E-mail</label>
                <input className="text-input" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
              </div>
              <div>
                <label className="label">Senha</label>
                <input className="text-input" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
              </div>
            </div>

            <div className="two-column-grid">
              <div>
                <label className="label">Nascimento</label>
                <input className="text-input" type="date" value={form.birthDate} onChange={(event) => updateField('birthDate', event.target.value)} />
              </div>
              <div>
                <label className="label">Observações</label>
                <input className="text-input" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
              </div>
            </div>

            {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

            <button className="primary-button auth-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta de cliente'}
            </button>
          </form>

          <div className="auth-links-stack">
            <Link to={ROUTE_PATHS.login}>Já tenho conta</Link>
            <Link to={ROUTE_PATHS.register}>Quero criar conta profissional</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
