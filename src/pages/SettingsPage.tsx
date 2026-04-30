import { useEffect, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { getCurrentUserId } from '../utils/auth'
import { api } from '../utils/api'
import type { Settings } from '../types/settings.types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      try {
        setIsLoading(true)
        const response = await api.get<Settings>(`/api/settings?userId=${getCurrentUserId()}`)
        if (isMounted) {
          setSettings(response)
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
    setSettings((current) => (current ? { ...current, [field]: value } : current))
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
        description="Preferências gerais do sistema."
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
          <h3>Preferências</h3>
          <div className="form-stack top-gap">
            <div>
              <label className="label">Tema</label>
              <select className="text-input" value={settings.theme} onChange={(event) => updateField('theme', event.target.value)}>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
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
              <span>Receber e-mail</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(event) => updateField('emailNotifications', event.target.checked)}
              />
            </label>

            <label className="toggle-row">
              <span>Receber WhatsApp</span>
              <input
                type="checkbox"
                checked={settings.whatsappNotifications}
                onChange={(event) => updateField('whatsappNotifications', event.target.checked)}
              />
            </label>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
