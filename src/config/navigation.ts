import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Clock3,
  DollarSign,
  UserCircle2,
  Building2,
  ShieldCheck,
  ShoppingBag,
  Settings,
} from 'lucide-react'
import { ROUTE_PATHS } from '../routes/routePaths'

export const professionalNavigationItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: ROUTE_PATHS.dashboard,
    icon: LayoutDashboard,
  },
  {
    key: 'appointments',
    label: 'Agendamentos',
    path: ROUTE_PATHS.appointments,
    icon: CalendarDays,
  },
  { key: 'clients', label: 'Clientes', path: ROUTE_PATHS.clients, icon: Users },
  { key: 'services', label: 'Serviços', path: ROUTE_PATHS.services, icon: Scissors },
  {
    key: 'availability',
    label: 'Disponibilidade',
    path: ROUTE_PATHS.availability,
    icon: Clock3,
  },
  { key: 'finance', label: 'Financeiro', path: ROUTE_PATHS.finance, icon: DollarSign },
  { key: 'profile', label: 'Perfil', path: ROUTE_PATHS.profile, icon: UserCircle2 },
  { key: 'settings', label: 'Configurações', path: ROUTE_PATHS.settings, icon: Settings },
  { key: 'catalog', label: 'Catálogo', path: ROUTE_PATHS.catalog, icon: ShoppingBag },
]

export const adminNavigationItems = [
  {
    key: 'admin-dashboard',
    label: 'Painel Admin',
    path: ROUTE_PATHS.adminDashboard,
    icon: LayoutDashboard,
  },
  {
    key: 'admin-companies',
    label: 'Empresas',
    path: ROUTE_PATHS.adminCompanies,
    icon: Building2,
  },
  { key: 'admin-users', label: 'Usuários', path: ROUTE_PATHS.adminUsers, icon: Users },
  {
    key: 'admin-billing',
    label: 'Cobranças',
    path: ROUTE_PATHS.adminBilling,
    icon: DollarSign,
  },
  {
    key: 'admin-settings',
    label: 'Configurações',
    path: ROUTE_PATHS.adminSettings,
    icon: ShieldCheck,
  },
]
