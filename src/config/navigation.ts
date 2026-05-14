import {
  CalendarDays,
  Clock3,
  Home,
  Package2,
  Scissors,
  Settings,
  UserCircle2,
  Users,
  DollarSign,
  Building2,
  Shield,
} from 'lucide-react'
import { ROUTE_PATHS } from '../routes/routePaths'

export const professionalNavigationItems = [
  { key: 'dashboard', label: 'Dashboard', path: ROUTE_PATHS.dashboard, icon: Home },
  { key: 'appointments', label: 'Agendamentos', path: ROUTE_PATHS.appointments, icon: CalendarDays },
  { key: 'clients', label: 'Clientes', path: ROUTE_PATHS.clients, icon: Users },
  { key: 'services', label: 'Serviços', path: ROUTE_PATHS.services, icon: Scissors },
  { key: 'catalog', label: 'Catálogo', path: ROUTE_PATHS.catalog, icon: Package2 },
  { key: 'availability', label: 'Disponibilidade', path: ROUTE_PATHS.availability, icon: Clock3 },
  { key: 'finance', label: 'Financeiro', path: ROUTE_PATHS.finance, icon: DollarSign },
  { key: 'profile', label: 'Perfil', path: ROUTE_PATHS.profile, icon: UserCircle2 },
  { key: 'settings', label: 'Configurações', path: ROUTE_PATHS.settings, icon: Settings },
]

export const adminNavigationItems = [
  { key: 'admin-dashboard', label: 'Painel Admin', path: ROUTE_PATHS.adminDashboard, icon: Home },
  { key: 'admin-companies', label: 'Empresas', path: ROUTE_PATHS.adminCompanies, icon: Building2 },
  { key: 'admin-users', label: 'Usuários', path: ROUTE_PATHS.adminUsers, icon: Users },
  { key: 'admin-billing', label: 'Cobranças', path: ROUTE_PATHS.adminBilling, icon: DollarSign },
  { key: 'admin-settings', label: 'Configurações', path: ROUTE_PATHS.settings, icon: Shield },
]