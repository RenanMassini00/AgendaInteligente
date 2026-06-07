import { FormEvent, useEffect, useMemo, useState } from 'react'
import PageCard from '../../components/ui/PageCard'
import SectionHeader from '../../components/ui/SectionHeader'
import { api } from '../../utils/api'
import type { AdminUser } from '../../types/admin.types'

type AdminUserForm = {
  fullName: string
  businessName?: string
  email: string
  phone?: string
  specialty?: string
  password: string
  publicSlug?: string
  timezone?: string
  isActive: boolean
  hasAppointmentsModule: boolean
  hasCatalogModule: boolean
}

const initialForm: AdminUserForm = {
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  specialty: '',
  password: '',
  publicSlug: '',
  timezone: 'America/Sao_Paulo',
  isActive: true,
  hasAppointmentsModule: true,
  hasCatalogModule: false,
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [form, setForm] = useState<AdminUserForm>(initialForm)

  const isEditing = useMemo(() => editingUserId !== null, [editingUserId])

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<AdminUser[]>('/api/admin/users')
      setUsers(response)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os usuários.')
    } finally {
      setIsLoading(false)
    }
  }

  function updateField<K extends keyof AdminUserForm>(field: K, value: AdminUserForm[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetForm() {
    setEditingUserId(null)
    setForm(initialForm)
  }

  function handleEdit(user: AdminUser) {
    setEditingUserId(user.id)
    setErrorMessage('')
    setSuccessMessage('')

    setForm({
      fullName: user.fullName,
      businessName: user.businessName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      specialty: user.specialty ?? '',
      password: '',
      publicSlug: user.publicSlug ?? '',
      timezone: user.timezone ?? 'America/Sao_Paulo',
      isActive: user.status === 'active',
      hasAppointmentsModule: user.hasAppointmentsModule,
      hasCatalogModule: user.hasCatalogModule,
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(user: AdminUser) {
    const confirmed = window.confirm(`Deseja inativar o usuário "${user.businessName || user.fullName}"?`)

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage('')
      setSuccessMessage('')

      await api.delete(`/api/admin/users/${user.id}`)

      setSuccessMessage('Usuário inativado com sucesso.')

      if (editingUserId === user.id) {
        resetForm()
      }

      await loadUsers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível inativar o usuário.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (isEditing && editingUserId !== null) {
        await api.put(`/api/admin/users/${editingUserId}`, {
          fullName: form.fullName,
          businessName: form.businessName || null,
          email: form.email,
          phone: form.phone || null,
          specialty: form.specialty || null,
          password: form.password || null,
          publicSlug: form.publicSlug || null,
          timezone: form.timezone || 'America/Sao_Paulo',
          isActive: form.isActive,
          hasAppointmentsModule: form.hasAppointmentsModule,
          hasCatalogModule: form.hasCatalogModule,
        } as never)

        setSuccessMessage('Usuário atualizado com sucesso.')
      } else {
        await api.post('/api/admin/users', {
          fullName: form.fullName,
          businessName: form.businessName || null,
          email: form.email,
          phone: form.phone || null,
          specialty: form.specialty || null,
          password: form.password,
          publicSlug: form.publicSlug || null,
          timezone: form.timezone || 'America/Sao_Paulo',
          hasAppointmentsModule: form.hasAppointmentsModule,
          hasCatalogModule: form.hasCatalogModule,
        } as never)

        setSuccessMessage('Usuário cadastrado com sucesso.')
      }

      resetForm()
      await loadUsers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o usuário.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack admin-users-page">
      <SectionHeader
        title="Usuários"
        description="Cadastre, altere ou inative usuários profissionais do sistema."
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="cards-grid two-cols admin-users-layout">
        <PageCard className="admin-users-form-card">
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>{isEditing ? 'Editar usuário profissional' : 'Novo usuário profissional'}</h3>
                <p>
                  {isEditing
                    ? 'Atualize os dados do usuário. Preencha a senha apenas se quiser trocá-la.'
                    : 'Use esse cadastro quando o profissional ainda não tiver criado a conta.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-grid two-column-grid">
              <div className="form-field">
                <label className="label" htmlFor="fullName">Nome do responsável</label>
                <input
                  id="fullName"
                  className="form-input"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="businessName">Nome da empresa</label>
                <input
                  id="businessName"
                  className="form-input"
                  value={form.businessName}
                  onChange={(event) => updateField('businessName', event.target.value)}
                  placeholder="Nome do negócio"
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  className="form-input"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="11999999999"
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="specialty">Especialidade</label>
                <input
                  id="specialty"
                  className="form-input"
                  value={form.specialty}
                  onChange={(event) => updateField('specialty', event.target.value)}
                  placeholder="Manicure, barbeiro, estética..."
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="publicSlug">Slug público</label>
                <input
                  id="publicSlug"
                  className="form-input"
                  value={form.publicSlug}
                  onChange={(event) => updateField('publicSlug', event.target.value)}
                  placeholder="meu-negocio"
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="timezone">Fuso horário</label>
                <input
                  id="timezone"
                  className="form-input"
                  value={form.timezone}
                  onChange={(event) => updateField('timezone', event.target.value)}
                  placeholder="America/Sao_Paulo"
                />
              </div>

              <div className="form-field">
                <label className="label" htmlFor="password">
                  {isEditing ? 'Nova senha (opcional)' : 'Senha temporária'}
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder={isEditing ? 'Digite apenas se quiser alterar' : 'Digite uma senha inicial'}
                />
              </div>

              {isEditing ? (
                <div className="full-width toggle-row">
                  <div>
                    <strong>Usuário ativo</strong>
                    <p className="muted-text">Desmarque para deixar o usuário inativo.</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => updateField('isActive', event.target.checked)}
                  />
                </div>
              ) : null}
              <div className="toggle-row">
                <div>
                  <strong>Módulo de agendamentos</strong>
                  <p className="muted-text">Libera agenda, clientes, serviços e disponibilidade.</p>
                </div>

                <input
                  type="checkbox"
                  checked={form.hasAppointmentsModule}
                  onChange={(event) => updateField('hasAppointmentsModule', event.target.checked)}
                />
              </div>

              <div className="toggle-row">
                <div>
                  <strong>Módulo de catálogo</strong>
                  <p className="muted-text">Libera cadastro de produtos e catálogo público.</p>
                </div>

                <input
                  type="checkbox"
                  checked={form.hasCatalogModule}
                  onChange={(event) => updateField('hasCatalogModule', event.target.checked)}
                />
              </div>

              <div className="full-width actions-row">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? (isEditing ? 'Salvando...' : 'Cadastrando...')
                    : (isEditing ? 'Salvar alterações' : 'Cadastrar usuário')}
                </button>

                {isEditing ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                  >
                    Cancelar edição
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </PageCard>

        <PageCard className="admin-users-list-card">
          <div className="card-stack">
            <div className="card-heading">
              <div>
                <h3>Usuários cadastrados</h3>
                <p>Profissionais disponíveis no sistema.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="feedback-card">Carregando usuários...</div>
            ) : users.length === 0 ? (
              <div className="feedback-card">Nenhum usuário profissional encontrado.</div>
            ) : (
              <div className="card-stack">
                {users.map((user) => (
                  <div key={user.id} className="dashboard-client-item admin-user-item">
                    <div className="admin-user-main">
                      <strong>{user.businessName || user.fullName}</strong>
                      <p className="muted-text">{user.fullName}</p>
                      <p className="muted-text small-text">{user.email}</p>
                      <p className="muted-text small-text">{user.phone || 'Sem telefone'}</p>
                      <p className="muted-text small-text">
                        {user.publicSlug ? `Slug: ${user.publicSlug}` : 'Sem slug público'}
                      </p>
                    </div>

                    <div className="card-stack admin-user-actions">
                      <span className="soft-pill">{user.status}</span>
                      <span className="soft-pill">{user.createdAt}</span>

                      <div className="item-actions">
                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={() => handleEdit(user)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="danger-button small-button"
                          onClick={() => handleDelete(user)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageCard>
      </div>
    </div>
  )
}
