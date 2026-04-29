import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { clientsMock } from '../mocks/clientsMock'

export default function ClientsPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Clientes"
        description="Gerencie os clientes cadastrados no sistema."
        action={<button className="primary-button">Novo cliente</button>}
      />

      <div className="cards-grid three-cols">
        {clientsMock.map((client) => (
          <PageCard key={client.id}>
            <div className="split-row">
              <div>
                <h3>{client.name}</h3>
                <p className="muted-text">{client.phone}</p>
              </div>
              <div className="avatar light">{client.name.charAt(0)}</div>
            </div>
          </PageCard>
        ))}
      </div>
    </div>
  )
}
