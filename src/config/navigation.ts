import {
  Building2,
  CalendarDays,
  Clock3,
  DollarSign,
  Home,
  LayoutDashboard,
  Scissors,
  Settings,
  Shield,
  ShoppingBag,
  UserCircle2,
  Users,
} from 'lucide-react'
import { ROUTE_PATHS } from '../routes/routePaths'

export const professionalNavigationItems = [
  { label: 'Dashboard', path: ROUTE_PATHS.dashboard, icon: Home },
  { label: 'Agendamentos', path: ROUTE_PATHS.appointments, icon: CalendarDays },
  { label: 'Clientes', path: ROUTE_PATHS.clients, icon: Users },
  { label: 'Serviços', path: ROUTE_PATHS.services, icon: Scissors },
  { label: 'Disponibilidade', path: ROUTE_PATHS.availability, icon: Clock3 },
  { label: 'Financeiro', path: ROUTE_PATHS.finance, icon: DollarSign },
  { label: 'Perfil', path: ROUTE_PATHS.profile, icon: UserCircle2 },
  { label: 'Catálogo', path: ROUTE_PATHS.catalog, icon: ShoppingBag },
  { label: 'Configurações', path: ROUTE_PATHS.settings, icon: Settings },
]

export const adminNavigationItems = [
  { label: 'Painel Admin', path: ROUTE_PATHS.adminDashboard, icon: LayoutDashboard },
  { label: 'Empresas', path: ROUTE_PATHS.adminCompanies, icon: Building2 },
  { label: 'Usuários', path: ROUTE_PATHS.adminUsers, icon: Users },
  { label: 'Cobranças', path: ROUTE_PATHS.adminBilling, icon: DollarSign },
  { label: 'Configurações', path: ROUTE_PATHS.settings, icon: Shield },
]