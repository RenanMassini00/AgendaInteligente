import { type FormEvent, useEffect, useState } from 'react'
import { Pencil, Plus, UserRound, UserRoundX } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { api } from '../utils/api'
import type {
  ProfessionalTeamEmployee,
  ProfessionalTeamEmployeeInput,
} from '../types/professional-team.types'

const EMPTY_FORM: ProfessionalTeamEmployeeInput = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  specialty: '',
  timezone: 'America/Sao_Paulo',
}

export default function ProfessionalTeamPage() {
  const [employees, setEmployees] = useState<ProfessionalTeamEmployee[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    void loadEmployees()
  }, [])

  async function loadEmployees() {
    try {
      setIsLoading(true)
      const response = await api.get<ProfessionalTeamEmployee[]>('/api/professional-team/employees')
      setEmployees(response)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível carregar a equipe.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingEmployeeId(null)
  }

  function startEditing(employee: ProfessionalTeamEmployee) {
    setForm({
      fullName: employee.fullName,
      email: employee.email ?? '',
      phone: employee.phone ?? '',
      password: '',
      specialty: employee.specialty ?? '',
      timezone: employee.timezone ?? 'America/Sao_Paulo',
    })
    setEditingEmployeeId(employee.id)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!form.fullName.trim() || !form.email.trim() || (editingEmployeeId === null && !form.password?.trim())) {
      setErrorMessage('Informe nome, e-mail e senha para cadastrar o funcionário.')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        ...(form.password?.trim() ? { password: form.password.trim() } : {}),
        phone: form.phone?.trim() || null,
        specialty: form.specialty?.trim() || null,
        timezone: form.timezone?.trim() || null,
      }

      if (editingEmployeeId === null) {
        await api.post('/api/professional-team/employees', payload)
        setSuccessMessage('Funcionário adicionado à equipe.')
      } else {
        await api.put(`/api/professional-team/employees/${editingEmployeeId}`, payload)
        setSuccessMessage('Funcionário atualizado.')
      }

      resetForm()
      await loadEmployees()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar o funcionário.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeactivate(employee: ProfessionalTeamEmployee) {
    if (!window.confirm(`Deseja inativar ${employee.fullName}?`)) return

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await api.delete(`/api/professional-team/employees/${employee.id}`)
      setSuccessMessage('Funcionário inativado.')
      await loadEmployees()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível inativar o funcionário.'
      )
    }
  }

  return (
    <div className="page-stack management-page">
      <SectionHeader
        title="Equipe"
        description="Cadastre os profissionais da equipe para organizar serviços e horários por funcionário."
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <PageCard>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="team-full-name">Nome completo</label>
            <input
              id="team-full-name"
              className="form-input"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
              autoComplete="name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="team-email">E-mail</label>
            <input
              id="team-email"
              className="form-input"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="team-password">
              {editingEmployeeId === null ? 'Senha inicial' : 'Nova senha (opcional)'}
            </label>
            <input
              id="team-password"
              className="form-input"
              type="password"
              value={form.password ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              autoComplete="new-password"
              required={editingEmployeeId === null}
            />
          </div>

          <div className="form-field">
            <label htmlFor="team-phone">Telefone</label>
            <input
              id="team-phone"
              className="form-input"
              type="tel"
              value={form.phone ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              autoComplete="tel"
            />
          </div>

          <div className="form-field">
            <label htmlFor="team-specialty">Especialidade</label>
            <input
              id="team-specialty"
              className="form-input"
              value={form.specialty ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, specialty: event.target.value }))
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="team-timezone">Fuso horário</label>
            <input
              id="team-timezone"
              className="form-input"
              value={form.timezone ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, timezone: event.target.value }))
              }
            />
          </div>

          <div className="actions-row full-width">
            {editingEmployeeId !== null ? (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancelar edição
              </button>
            ) : null}
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {editingEmployeeId !== null ? <Pencil size={17} /> : <Plus size={17} />}
              {isSubmitting
                ? 'Salvando...'
                : editingEmployeeId !== null
                  ? 'Atualizar funcionário'
                  : 'Adicionar funcionário'}
            </button>
          </div>
        </form>
      </PageCard>

      <div className="cards-grid three-cols compact-entity-grid">
        {isLoading ? (
          <div className="feedback-card">Carregando equipe...</div>
        ) : employees.length === 0 ? (
          <div className="feedback-card">Nenhum funcionário cadastrado.</div>
        ) : (
          employees.map((employee) => (
            <PageCard key={employee.id} className="compact-entity-card">
              <div className="entity-card">
                <div className="entity-card-head">
                  <div className="entity-icon">
                    <UserRound size={18} />
                  </div>
                  <div className="entity-card-title">
                    <h3>{employee.fullName}</h3>
                    <span>{employee.email || employee.phone || 'Sem contato cadastrado'}</span>
                  </div>
                </div>
                <div className="entity-card-meta-list">
                  <span>Identificador do funcionário: {employee.userId}</span>
                  <span>{employee.specialty || 'Profissional da equipe'}</span>
                </div>
                <div className="entity-card-actions">
                  <button
                    type="button"
                    className="secondary-button small-button"
                    onClick={() => startEditing(employee)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="danger-button small-button"
                    onClick={() => void handleDeactivate(employee)}
                  >
                    <UserRoundX size={16} />
                    Inativar
                  </button>
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
