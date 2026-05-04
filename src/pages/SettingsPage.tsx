import { ChangeEvent, useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Settings } from '../types/settings.types'
import { clearCompanyLogo, getCompanyLogo, setCompanyLogo } from '../utils/branding'
import { setStoredTheme, type AppTheme } from '../utils/theme'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [logoPreview, setLogoPreview] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      try {
        setIsLoading(true)
        const response = await api.get<Settings>(`/api/settings?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setSettings(response)
          setLogoPreview(getCompanyLogo())
          setStoredTheme((response.theme === 'dark' ? 'dark' : 'light') as AppTheme)
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar as configurações.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSettings()
    return () => {
      isMounted = false
    }
  }, [])

  function updateField<K extends keyof Settings>(field: K, value: Settings[K]) {
    setSettings((current) => {
      if (!current) return current
      const updated = { ...current, [field]: value }

      if (field === 'theme') {
        setStoredTheme((value === 'dark' ? 'dark' : 'light') as AppTheme)
      }

      return updated
    })
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setLogoPreview(result)
    }

    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!settings) return

    try {
      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const response = await api.put<Settings>(`/api/settings?userId=${getCurrentUserId()}`, {
        theme: settings.theme,
        languageCode: settings.languageCode,
        reminderMinutes: Number(settings.reminderMinutes),
        emailNotifications: settings.emailNotifications,
        whatsappNotifications: settings.whatsappNotifications,
      })

      setSettings(response)
      setStoredTheme((response.theme === 'dark' ? 'dark' : 'light') as AppTheme)

      if (logoPreview) {
        setCompanyLogo(logoPreview)
      } else {
        clearCompanyLogo()
      }

      setSuccessMessage('Configurações salvas com sucesso.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar as configurações.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !settings) {
    return <div className="feedback-card">Carregando configurações...</div>
  }

  if (!settings) {
    return <div className="feedback-card error-box">{errorMessage || 'Configurações não encontradas.'}</div>
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Configurações"
        description="Personalize a aparência e a identidade visual do sistema."
        action={
          <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        }
      />

      {errorMessage ? <div className="feedback-card error-box">{errorMessage}</div> : null}
      {successMessage ? <div className="feedback-card success-box">{successMessage}</div> : null}

      <div className="cards-grid two-cols">
        <PageCard>
          <h3>Aparência</h3>
          <div className="form-stack top-gap">
            <div>
              <label className="label">Tema</label>
              <div className="theme-switcher">
                <button
                  type="button"
                  className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`.trim()}
                  onClick={() => updateField('theme', 'light')}
                >
                  Claro
                </button>
                <button
                  type="button"
                  className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`.trim()}
                  onClick={() => updateField('theme', 'dark')}
                >
                  Escuro
                </button>
              </div>
            </div>

            <div>
              <label className="label">Idioma</label>
              <select className="text-input" value={settings.languageCode} onChange={(event) => updateField('languageCode', event.target.value)}>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div>
              <label className="label">Lembrete padrão (min)</label>
              <input
                className="text-input"
                type="number"
                min={0}
                value={settings.reminderMinutes}
                onChange={(event) => updateField('reminderMinutes', Number(event.target.value))}
              />
            </div>
          </div>
        </PageCard>

        <PageCard>
          <h3>Notificações</h3>
          <div className="toggle-list top-gap">
            <label className="toggle-row">
              <div>
                <strong>E-mail</strong>
                <p className="small-text">Receba atualizações importantes por e-mail.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(event) => updateField('emailNotifications', event.target.checked)}
              />
            </label>

            <label className="toggle-row">
              <div>
                <strong>WhatsApp</strong>
                <p className="small-text">Use lembretes rápidos para confirmar atendimentos.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappNotifications}
                onChange={(event) => updateField('whatsappNotifications', event.target.checked)}
              />
            </label>
          </div>
        </PageCard>

        <PageCard className="branding-card two-column-grid">
          <div className="branding-preview">
            <div className="branding-preview-card">
              {logoPreview ? <img src={logoPreview} alt="Logo da empresa" className="branding-logo-preview" /> : <div className="branding-logo-placeholder">Logo</div>}
              <div>
                <strong>Pré-visualização</strong>
                <p className="small-text">Sua logo aparecerá no menu lateral e no topo.</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <div>
              <label className="label">Logo da empresa</label>
              <input className="text-input" type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            <div className="section-actions">
              <button type="button" className="secondary-button" onClick={() => setLogoPreview('')}>
                Remover logo
              </button>
            </div>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
