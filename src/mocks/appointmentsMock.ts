import type { Appointment } from '../types/appointment.types'

export const appointmentsMock: Appointment[] = [
  {
    id: '1',
    clientName: 'Mariana Costa',
    serviceName: 'Corte feminino',
    date: '2026-04-29',
    time: '09:00',
    status: 'confirmed',
    price: 90,
  },
  {
    id: '2',
    clientName: 'Lucas Ferreira',
    serviceName: 'Treino funcional',
    date: '2026-04-29',
    time: '10:30',
    status: 'scheduled',
    price: 120,
  },
  {
    id: '3',
    clientName: 'Patrícia Lima',
    serviceName: 'Manicure',
    date: '2026-04-29',
    time: '14:00',
    status: 'completed',
    price: 50,
  },
  {
    id: '4',
    clientName: 'André Souza',
    serviceName: 'Design de sobrancelha',
    date: '2026-04-30',
    time: '08:30',
    status: 'scheduled',
    price: 45,
  },
]
