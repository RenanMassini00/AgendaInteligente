import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'
import { servicesMock } from '../mocks/servicesMock'

export default function ServicesPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Serviços"
        description="Cadastre os serviços que poderão ser agendados."
        action={<button className="primary-button">Novo serviço</button>}
      />

      <div className="cards-grid three-cols">
        {servicesMock.map((service) => (
          <PageCard key={service.id}>
            <h3>{service.name}</h3>
            <p className="muted-text">Duração: {service.duration}</p>
            <span className="soft-pill top-gap">{service.price}</span>
          </PageCard>
        ))}
      </div>
    </div>
  )
}
