import PageCard from '../components/ui/PageCard'
import SectionHeader from '../components/ui/SectionHeader'

const availability = [
  { day: 'Segunda-feira', hours: '08:00 às 18:00' },
  { day: 'Terça-feira', hours: '08:00 às 18:00' },
  { day: 'Quarta-feira', hours: '08:00 às 18:00' },
  { day: 'Quinta-feira', hours: '08:00 às 18:00' },
  { day: 'Sexta-feira', hours: '08:00 às 17:00' },
  { day: 'Sábado', hours: '08:00 às 12:00' },
]

export default function AvailabilityPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Disponibilidade"
        description="Defina os dias e horários disponíveis para atendimento."
        action={<button className="primary-button">Editar agenda</button>}
      />

      <div className="cards-grid two-cols">
        {availability.map((item) => (
          <PageCard key={item.day}>
            <h3>{item.day}</h3>
            <p className="muted-text">Horário disponível</p>
            <span className="soft-pill top-gap">{item.hours}</span>
          </PageCard>
        ))}
      </div>
    </div>
  )
}
