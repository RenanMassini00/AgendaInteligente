import { useMemo } from 'react'
import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { useTheme } from '../contexts/ThemeContext'

export default function SettingsPage() {
  const { mode, accent, setMode, setAccent } = useTheme()

  const selectedThemeLabel = useMemo(() => {
    if (mode === 'light' && accent === 'blue') return 'Claro Azul'
    if (mode === 'dark' && accent === 'blue') return 'Escuro Azul'
    if (mode === 'light' && accent === 'pink') return 'Claro Rosa'
    return 'Escuro Rosa'
  }, [mode, accent])

  return (
    <div className="page-stack">
      <SectionHeader
        title="Configurações"
        description="Personalize o visual do sistema da forma que combinar mais com seu negócio."
      />

      <PageCard>
        <div className="settings-grid">
          <div className="settings-block">
            <h3>Modo do tema</h3>
            <p className="muted-text">
              Escolha entre a versão clara ou escura.
            </p>

            <div className="theme-options-grid">
              <button
                type="button"
                className={`theme-option-card ${mode === 'light' ? 'active' : ''}`}
                onClick={() => setMode('light')}
              >
                <span className="theme-preview light-preview" />
                <strong>Claro</strong>
                <small>Mais leve e clean</small>
              </button>

              <button
                type="button"
                className={`theme-option-card ${mode === 'dark' ? 'active' : ''}`}
                onClick={() => setMode('dark')}
              >
                <span className="theme-preview dark-preview" />
                <strong>Escuro</strong>
                <small>Mais elegante e moderno</small>
              </button>
            </div>
          </div>

          <div className="settings-block">
            <h3>Cor principal</h3>
            <p className="muted-text">
              Escolha o estilo visual principal do sistema.
            </p>

            <div className="theme-options-grid">
              <button
                type="button"
                className={`theme-option-card ${accent === 'blue' ? 'active' : ''}`}
                onClick={() => setAccent('blue')}
              >
                <span className="theme-preview blue-preview" />
                <strong>Azul</strong>
                <small>Profissional, neutro e versátil</small>
              </button>

              <button
                type="button"
                className={`theme-option-card ${accent === 'pink' ? 'active' : ''}`}
                onClick={() => setAccent('pink')}
              >
                <span className="theme-preview pink-preview" />
                <strong>Rosa</strong>
                <small>Perfeito para beleza e estética</small>
              </button>
            </div>
          </div>

          <div className="settings-block">
            <h3>Tema atual</h3>
            <p className="muted-text">
              O sistema está usando:
            </p>

            <div className="theme-current-box">
              <strong>{selectedThemeLabel}</strong>
              <span>
                Você pode trocar a qualquer momento e a preferência fica salva.
              </span>
            </div>
          </div>
        </div>
      </PageCard>
    </div>
  )
}