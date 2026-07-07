import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { api } from '../utils/api'
import { getCurrentRole, getCurrentUser, getCurrentUserId } from '../utils/auth'
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

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialPasswordForm: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const maxLogoFileSize = 5 * 1024 * 1024
const maxLogoDataUrlLength = 85_000
const logoImageEdges = [640, 512, 384, 320, 256]
const logoImageQualities = [0.82, 0.72, 0.62, 0.52]

function isEmbeddedImageUrl(value: string) {
  return value.trim().startsWith('data:image/')
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Não foi possível ler a imagem selecionada.'))
    }
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível preparar a imagem selecionada.'))
    image.src = dataUrl
  })
}

function canvasToCompressedDataUrl(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number
) {
  const webpDataUrl = canvas.toDataURL('image/webp', quality)

  if (webpDataUrl.startsWith('data:image/webp')) {
    return webpDataUrl
  }

  const fallbackCanvas = document.createElement('canvas')
  const fallbackContext = fallbackCanvas.getContext('2d')

  if (!fallbackContext) {
    return canvas.toDataURL('image/jpeg', quality)
  }

  fallbackCanvas.width = width
  fallbackCanvas.height = height
  fallbackContext.fillStyle = '#ffffff'
  fallbackContext.fillRect(0, 0, width, height)
  fallbackContext.drawImage(image, 0, 0, width, height)

  return fallbackCanvas.toDataURL('image/jpeg', quality)
}

async function fileToLogoDataUrl(file: File) {
  const originalDataUrl = await readFileAsDataUrl(file)

  if (file.type === 'image/svg+xml') {
    if (originalDataUrl.length <= maxLogoDataUrlLength) {
      return originalDataUrl
    }

    throw new Error('O SVG selecionado é muito grande. Envie um SVG menor ou uma imagem PNG/JPG.')
  }

  const image = await loadImage(originalDataUrl)
  const originalWidth = image.naturalWidth || image.width
  const originalHeight = image.naturalHeight || image.height
  let bestResult = originalDataUrl.length <= maxLogoDataUrlLength ? originalDataUrl : ''

  for (const maxEdge of logoImageEdges) {
    const scale = Math.min(1, maxEdge / Math.max(originalWidth, originalHeight))
    const width = Math.max(1, Math.round(originalWidth * scale))
    const height = Math.max(1, Math.round(originalHeight * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      break
    }

    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    for (const quality of logoImageQualities) {
      const dataUrl = canvasToCompressedDataUrl(canvas, image, width, height, quality)

      if (!bestResult || dataUrl.length < bestResult.length) {
        bestResult = dataUrl
      }

      if (dataUrl.length <= maxLogoDataUrlLength) {
        return dataUrl
      }
    }
  }

  if (bestResult && bestResult.length <= maxLogoDataUrlLength) {
    return bestResult
  }

  throw new Error('Não foi possível reduzir essa imagem. Envie um logo menor ou em outro formato.')
}

function AdminSettingsPage() {
  const [users, setUsers] = useState<AdminBrandingUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const [theme, setTheme] = useState<ThemeMode>('light')
  const [accentColor, setAccentColor] = useState<AccentColor>('blue')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  const [logoUrlInput, setLogoUrlInput] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoFileName, setLogoFileName] = useState('')

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
        setLogoUrlInput('')
        setLogoPreview('')
        setLogoFileName('')
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
    const logoUrl = user.companyLogoUrl || ''

    setTheme(user.theme)
    setAccentColor(user.accentColor)
    setCompanyLogoUrl(logoUrl)
    setLogoUrlInput(isEmbeddedImageUrl(logoUrl) ? '' : logoUrl)
    setLogoPreview(logoUrl)
    setLogoFileName(isEmbeddedImageUrl(logoUrl) ? 'Logo cadastrado' : '')
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
      event.target.value = ''
      return
    }

    if (file.size > maxLogoFileSize) {
      setErrorMessage('A imagem deve ter no máximo 5MB.')
      event.target.value = ''
      return
    }

    try {
      setErrorMessage('')
      const dataUrl = await fileToLogoDataUrl(file)
      setCompanyLogoUrl(dataUrl)
      setLogoUrlInput('')
      setLogoPreview(dataUrl)
      setLogoFileName(file.name)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível anexar a imagem.')
    } finally {
      event.target.value = ''
    }
  }

  function handleLogoUrlChange(value: string) {
    setLogoUrlInput(value)
    setCompanyLogoUrl(value)
    setLogoPreview(value)
    setLogoFileName('')
  }

  function handleClearLogo() {
    setCompanyLogoUrl('')
    setLogoUrlInput('')
    setLogoPreview('')
    setLogoFileName('')
  }

  async function handleSave() {
    if (!selectedUserId) return
    const normalizedCompanyLogoUrl = companyLogoUrl.trim()

    if (
      isEmbeddedImageUrl(normalizedCompanyLogoUrl) &&
      normalizedCompanyLogoUrl.length > maxLogoDataUrlLength
    ) {
      setErrorMessage('O logo anexado ficou muito grande. Escolha um arquivo menor.')
      setSuccessMessage('')
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      await api.put(`/api/admin/settings/users/${selectedUserId}`, {
        theme,
        accentColor,
        companyLogoUrl: normalizedCompanyLogoUrl || null,
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
                          value={logoUrlInput}
                          onChange={(event) => handleLogoUrlChange(event.target.value)}
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
                        {logoFileName ? (
                          <small className="admin-logo-file-note">
                            Arquivo anexado: {logoFileName}
                          </small>
                        ) : null}
                      </div>

                      {logoPreview ? (
                        <button
                          type="button"
                          className="secondary-button small-button admin-logo-clear-button"
                          onClick={handleClearLogo}
                        >
                          <Trash2 size={15} />
                          Remover logo
                        </button>
                      ) : null}
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

function ProfessionalSettingsPage() {
  const user = getCurrentUser()
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(initialPasswordForm)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('')

  function updatePasswordField<K extends keyof PasswordForm>(
    field: K,
    value: PasswordForm[K]
  ) {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordErrorMessage('Preencha a senha atual, a nova senha e a confirmação.')
      setPasswordSuccessMessage('')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordErrorMessage('A nova senha deve ter pelo menos 6 caracteres.')
      setPasswordSuccessMessage('')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrorMessage('A confirmação precisa ser igual à nova senha.')
      setPasswordSuccessMessage('')
      return
    }

    try {
      setIsSavingPassword(true)
      setPasswordErrorMessage('')
      setPasswordSuccessMessage('')

      await api.patch('/api/profile/password', {
        userId: getCurrentUserId(),
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      } as never)

      setPasswordForm(initialPasswordForm)
      setPasswordSuccessMessage('Senha alterada com sucesso.')
    } catch (error) {
      setPasswordErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a senha.'
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Configurações"
        description="Gerencie a segurança do seu acesso profissional."
      />

      {passwordErrorMessage ? (
        <div className="feedback-card error-box">{passwordErrorMessage}</div>
      ) : null}
      {passwordSuccessMessage ? (
        <div className="feedback-card success-box">{passwordSuccessMessage}</div>
      ) : null}

      <PageCard className="professional-settings-card">
        <div className="professional-settings-header">
          <div>
            <h3>Senha de acesso</h3>
            <p>Atualize sua senha usando a senha atual da conta.</p>
          </div>

          <div className="professional-settings-account">
            <span>Conta</span>
            <strong>{user?.businessName || user?.fullName || 'Profissional'}</strong>
            <small>{user?.email || 'E-mail não encontrado'}</small>
          </div>
        </div>

        <form
          className="form-grid two-column-grid professional-password-form"
          onSubmit={handlePasswordSubmit}
        >
          <div className="form-field full-width">
            <label className="label" htmlFor="currentPassword">Senha atual</label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="newPassword">Nova senha</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField('newPassword', event.target.value)}
              placeholder="Digite a nova senha"
              autoComplete="new-password"
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="confirmPassword">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </div>

          <div className="full-width actions-row">
            <button
              type="submit"
              className="primary-button"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? 'Alterando...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </PageCard>
    </div>
  )
}

export default function SettingsPage() {
  return getCurrentRole() === 'master_admin'
    ? <AdminSettingsPage />
    : <ProfessionalSettingsPage />
}
