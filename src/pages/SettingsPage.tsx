import { ChangeEvent, useMemo, useState } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { getBranding, saveBranding } from '../utils/branding'
import { AppTheme, getStoredTheme, setStoredTheme } from '../utils/theme'

export default function SettingsPage() {
  const initialBranding = useMemo(() => getBranding(), [])
  const initialTheme = useMemo(() => getStoredTheme(), [])

  const [theme, setTheme] = useState<AppTheme>(initialTheme)
  const [companyName, setCompanyName] = useState(initialBranding.companyName)
  const [subtitle, setSubtitle] = useState(initialBranding.subtitle)
  const [logoUrl, setLogoUrl] = useState(initialBranding.logoUrl)
  const [successMessage, setSuccessMessage] = useState('')

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedTheme = event.target.value as AppTheme
    setTheme(selectedTheme)
    setStoredTheme(selectedTheme)
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setLogoUrl(result)
    }

    reader.readAsDataURL(file)
  }

  function handleSave() {
    saveBranding({
      companyName,
      subtitle,
      logoUrl,
    })

    setSuccessMessage('Configurações salvas com sucesso.')
    window.dispatchEvent(new Event('storage'))
  }

  function handleRemoveLogo() {
    setLogoUrl('')
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Configurações"
        description="Personalize a aparência do sistema e a identidade da empresa."
      />

      <div className="settings-grid">
        <PageCard>
          <div className="settings-section">
            <h3>Aparência</h3>
            <p className="muted-text">Escolha o tema visual da aplicação.</p>

            <div className="form-field">
              <label htmlFor="theme">Tema</label>
              <select
                id="theme"
                value={theme}
                onChange={handleThemeChange}
                className="form-input"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
          </div>
        </PageCard>

        <PageCard>
          <div className="settings-section">
            <h3>Identidade da empresa</h3>
            <p className="muted-text">
              Defina nome, subtítulo e logo que serão exibidos no sistema.
            </p>

            <div className="form-field">
              <label htmlFor="companyName">Nome da empresa</label>
              <input
                id="companyName"
                className="form-input"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Ex.: Studio Bella"
              />
            </div>

            <div className="form-field">
              <label htmlFor="subtitle">Subtítulo</label>
              <input
                id="subtitle"
                className="form-input"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Ex.: Estética e Bem-estar"
              />
            </div>

            <div className="form-field">
              <label htmlFor="logo">Logo da empresa</label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handleLogoChange}
              />
            </div>

            {logoUrl && (
              <div className="logo-preview-card">
                <img src={logoUrl} alt="Logo da empresa" className="logo-preview-image" />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleRemoveLogo}
                >
                  Remover logo
                </button>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="primary-button" onClick={handleSave}>
                Salvar configurações
              </button>
            </div>

            {successMessage && <div className="success-box">{successMessage}</div>}
          </div>
        </PageCard>
      </div>
    </div>
  )
}