import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <SectionHeader title="Configurações" description="Preferências gerais do sistema." />
      <div className="cards-grid two-cols">
        <PageCard>
          <h3>Notificações</h3>
          <p className="muted-text">Ative lembretes automáticos para seus clientes.</p>
        </PageCard>
        <PageCard>
          <h3>Tema e aparência</h3>
          <p className="muted-text">Personalize cores e preferências da interface.</p>
        </PageCard>
      </div>
    </div>
  )
}
