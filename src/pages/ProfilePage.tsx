import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="muted-text strong">{label}</p>
      <div className="field-box">{value}</div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="page-stack">
      <SectionHeader title="Perfil" description="Informações principais do profissional." />
      <PageCard>
        <div className="cards-grid two-cols">
          <Field label="Nome" value="Renan Studio" />
          <Field label="Especialidade" value="Profissional autônomo" />
          <Field label="E-mail" value="renan@email.com" />
          <Field label="Telefone" value="(11) 99999-9999" />
        </div>
      </PageCard>
    </div>
  )
}
