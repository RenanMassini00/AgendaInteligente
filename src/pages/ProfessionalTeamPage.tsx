import { type FormEvent, useEffect, useState } from 'react'
import { Pencil, Plus, UserRound, UserRoundX } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { api } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'
import type {
  ProfessionalTeamEmployee,
  ProfessionalTeamEmployeeInput,
} from '../types/professional-team.types'

const EMPTY_FORM: ProfessionalTeamEmployeeInput = {
  fullName: '',
  email: '',
  phone: '',
  isActive: true,
}

export default function ProfessionalTeamPage() {
  const ownerUserId = getCurrentUserId()
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
      const response = await api.get<ProfessionalTeamEmployee[]>(
        `/api/professional-team/employees?ownerUserId=${ownerUserId}`
      )
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
      isActive: employee.isActive,
    })
    setEditingEmployeeId(employee.id)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!form.fullName.trim()) {
      setErrorMessage('Informe o nome do funcionário.')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        isActive: form.isActive,
      }

      if (editingEmployeeId === null) {
        await api.post(
          `/api/professional-team/employees?ownerUserId=${ownerUserId}`,
          payload
        )
        setSuccessMessage('Funcionário adicionado à equipe.')
      } else {
        await api.put(
          `/api/professional-team/employees/${editingEmployeeId}?ownerUserId=${ownerUserId}`,
          payload
        )
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
      await api.delete(
        `/api/professional-team/employees/${employee.id}?ownerUserId=${ownerUserId}`
      )
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

      <div className="feedback-card error-box" role="alert">
        Atenção: os endpoints de equipe ainda precisam validar a identidade e a autorização no
        backend. Não publique esta tela antes dessa proteção.
      </div>
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
            <label htmlFor="team-phone">Telefone</label>
            <input
              id="team-phone"
              className="form-input"
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              autoComplete="tel"
            />
          </div>

          {editingEmployeeId !== null ? (
            <div className="form-field checkbox-field">
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                Funcionário ativo
              </label>
            </div>
          ) : null}

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
                  <span>{employee.isActive ? 'Ativo' : 'Inativo'}</span>
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
                  {employee.isActive ? (
                    <button
                      type="button"
                      className="danger-button small-button"
                      onClick={() => void handleDeactivate(employee)}
                    >
                      <UserRoundX size={16} />
                      Inativar
                    </button>
                  ) : null}
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  )
}
