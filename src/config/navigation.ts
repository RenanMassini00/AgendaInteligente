import {
  CalendarDays,
  Clock3,
  Home,
  Scissors,
  Settings,
  UserCircle2,
  Users,
} from 'lucide-react'
import { ROUTE_PATHS } from '../routes/routePaths'

export const navigationItems = [
  { label: 'Dashboard', path: ROUTE_PATHS.dashboard, icon: Home },
  { label: 'Agendamentos', path: ROUTE_PATHS.appointments, icon: CalendarDays },
  { label: 'Clientes', path: ROUTE_PATHS.clients, icon: Users },
  { label: 'Serviços', path: ROUTE_PATHS.services, icon: Scissors },
  { label: 'Disponibilidade', path: ROUTE_PATHS.availability, icon: Clock3 },
  { label: 'Perfil', path: ROUTE_PATHS.profile, icon: UserCircle2 },
  { label: 'Configurações', path: ROUTE_PATHS.settings, icon: Settings },
]
