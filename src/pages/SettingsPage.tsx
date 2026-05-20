import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { api } from '../utils/api'
import type {
  AccentColor,
  AdminBrandingUser,
  ThemeMode,
} from '../types/settings.types'

const accentOptions: Array<{
  value: AccentColor
  label: string
  previewClass: string
}> = [
  { value: 'blue', label: 'Azul', previewClass: 'accent-preview-blue' },
  { value: 'pink', label: 'Rosa', previewClass: 'accent-preview-pink' },
  { value: 'violet', label: 'Violeta', previewClass: 'accent-preview-violet' },
  { value: 'emerald', label: 'Esmeralda', previewClass: 'accent-preview-emerald' },
  { value: 'cyan', label: 'Ciano', previewClass: 'accent-preview-cyan' },
  { value: 'amber', label: 'Âmbar', previewClass: 'accent-preview-amber' },
  { value: 'rose', label: 'Rose', previewClass: 'accent-preview-rose' },
  { value: 'slate', label: 'Slate', previewClass: 'accent-preview-slate' },
]

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function SettingsPage() {
  const [users, setUsers] = useState<AdminBrandingUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const [theme, setTheme] = useState<ThemeMode>('light')
  const [accentColor, setAccentColor] = useState<AccentColor>('blue')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedUser = useMemo(
    () => users.find((item) => item.userId === selectedUserId) ?? null,
    [users, selectedUserId]
  )

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const response = await api.get<AdminBrandingUser[]>('/api/admin/settings/users')
      setUsers(response)

      if (response.length > 0) {
        const first = response[0]
        applyUserToForm(first)
        setSelectedUserId(first.userId)
      } else {
        setSelectedUserId(null)
        setCompanyLogoUrl('')
        setLogoPreview('')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os usuários.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function applyUserToForm(user: AdminBrandingUser) {
    setTheme(user.theme)
    setAccentColor(user.accentColor)
    setCompanyLogoUrl(user.companyLogoUrl || '')
    setLogoPreview(user.companyLogoUrl || '')
  }

  function handleSelectUser(user: AdminBrandingUser) {
    setSelectedUserId(user.userId)
    setSuccessMessage('')
    setErrorMessage('')
    applyUserToForm(user)
  }

  async function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecione um arquivo de imagem válido.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 2MB.')
      return
    }

    const dataUrl = await fileToDataUrl(file)
    setCompanyLogoUrl(dataUrl)
    setLogoPreview(dataUrl)
  }

  async function handleSave() {
    if (!selectedUserId) return

    try {
      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      await api.put(`/api/admin/settings/users/${selectedUserId}`, {
        theme,
        accentColor,
        companyLogoUrl: companyLogoUrl || null,
      })

      setSuccessMessage('Configurações visuais salvas com sucesso.')
      await loadUsers()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar as configurações.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Configurações"
        description="Defina tema, cor principal e logo das empresas. Essas configurações serão aplicadas somente pelo admin."
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      {isLoading ? (
        <PageCard>Carregando configurações...</PageCard>
      ) : (
        <div className="admin-branding-grid">
          <PageCard className="admin-branding-users-card">
            <div className="admin-branding-users-header">
              <h3>Empresas / acessos</h3>
              <p>Selecione qual acesso deseja personalizar.</p>
            </div>

            <div className="admin-branding-users-list">
              {users.map((user) => {
                const isActive = user.userId === selectedUserId
                const title = user.businessName || user.fullName
                const initials = title.slice(0, 1).toUpperCase()

                return (
                  <button
                    key={user.userId}
                    type="button"
                    className={`admin-branding-user-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    {user.companyLogoUrl ? (
                      <img
                        src={user.companyLogoUrl}
                        alt={title}
                        className="admin-branding-user-logo"
                      />
                    ) : (
                      <div className="admin-branding-user-avatar">{initials}</div>
                    )}

                    <div className="admin-branding-user-copy">
                      <strong>{title}</strong>
                      <span>{user.email}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </PageCard>

          <PageCard className="admin-branding-editor-card">
            {selectedUser ? (
              <>
                <div className="admin-branding-editor-header">
                  <div>
                    <h3>{selectedUser.businessName || selectedUser.fullName}</h3>
                    <p>Personalize o acesso visual dessa empresa.</p>
                  </div>
                </div>

                <div className="admin-branding-section">
                  <h4>Modo do tema</h4>
                  <div className="admin-theme-grid">
                    <button
                      type="button"
                      className={`admin-theme-card ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="admin-theme-preview admin-theme-preview-light" />
                      <strong>Claro</strong>
                      <span>Mais leve e clean</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-theme-card ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="admin-theme-preview admin-theme-preview-dark" />
                      <strong>Escuro</strong>
                      <span>Mais elegante e moderno</span>
                    </button>
                  </div>
                </div>

                <div className="admin-branding-section">
                  <h4>Cor principal</h4>
                  <div className="admin-accent-grid">
                    {accentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`admin-accent-card ${accentColor === option.value ? 'active' : ''}`}
                        onClick={() => setAccentColor(option.value)}
                      >
                        <div className={`admin-accent-preview ${option.previewClass}`} />
                        <strong>{option.label}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-branding-section">
                  <h4>Logo da empresa</h4>

                  <div className="admin-logo-grid">
                    <div className="admin-logo-preview-card">
                      <div className="admin-logo-preview-box">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="admin-logo-preview-image"
                          />
                        ) : (
                          <span>Sem logo</span>
                        )}
                      </div>
                    </div>

                    <div className="admin-logo-form-card">
                      <div className="form-field">
                        <label htmlFor="companyLogoUrl">URL da logo</label>
                        <input
                          id="companyLogoUrl"
                          className="form-input"
                          value={companyLogoUrl}
                          onChange={(event) => {
                            setCompanyLogoUrl(event.target.value)
                            setLogoPreview(event.target.value)
                          }}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="companyLogoFile">Ou enviar imagem</label>
                        <input
                          id="companyLogoFile"
                          type="file"
                          accept="image/*"
                          className="form-input"
                          onChange={handleLogoFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-branding-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar configurações'}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">Nenhum usuário disponível.</div>
            )}
          </PageCard>
        </div>
      )}
    </div>
  )
}