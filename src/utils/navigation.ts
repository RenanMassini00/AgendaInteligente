import { adminNavigationItems, professionalNavigationItems } from '../config/navigation'
import type { LucideIcon } from 'lucide-react'
import type { Session } from './auth'

export type NavigationItem = {
  key: string
  label: string
  path: string
  icon: LucideIcon
}

const appointmentModuleKeys = new Set([
  'appointments',
  'clients',
  'services',
  'availability',
  'finance',
])

const professionalMobilePriority = [
  'dashboard',
  'appointments',
  'clients',
  'catalog',
  'finance',
  'services',
]

const adminMobilePriority = [
  'admin-dashboard',
  'admin-companies',
  'admin-users',
  'admin-billing',
]

export function getNavigationItemsForUser(user: Session | null): NavigationItem[] {
  if (user?.role === 'master_admin') {
    return adminNavigationItems
  }

  return professionalNavigationItems.filter((item) => {
    if (item.key === 'catalog') {
      return user?.hasCatalogModule
    }

    if (appointmentModuleKeys.has(item.key)) {
      return user?.hasAppointmentsModule
    }

    return true
  })
}

export function getCurrentNavigationItem(
  navigationItems: NavigationItem[],
  pathname: string
) {
  return [...navigationItems]
    .sort((first, second) => second.path.length - first.path.length)
    .find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
}

export function getMobileNavigationItems(
  navigationItems: NavigationItem[],
  user: Session | null
) {
  const priority =
    user?.role === 'master_admin' ? adminMobilePriority : professionalMobilePriority

  const navigationByKey = new Map(navigationItems.map((item) => [item.key, item]))
  const prioritizedItems = priority
    .map((key) => navigationByKey.get(key))
    .filter((item): item is NavigationItem => Boolean(item))

  const fallbackItems = navigationItems.filter(
    (item) => !prioritizedItems.some((priorityItem) => priorityItem.key === item.key)
  )

  return [...prioritizedItems, ...fallbackItems].slice(0, 4)
}

export function getWorkspaceModuleCopy(user: Session | null) {
  if (user?.role === 'master_admin') {
    return {
      label: 'Área administrativa',
      summary: 'Operação SaaS',
      description: 'Empresas, usuários, cobrança e identidade visual.',
    }
  }

  if (user?.hasAppointmentsModule && user?.hasCatalogModule) {
    return {
      label: 'Módulos ativos',
      summary: 'Agenda e catálogo',
      description: 'Atendimentos, clientes, serviços e produtos no mesmo painel.',
    }
  }

  if (user?.hasCatalogModule) {
    return {
      label: 'Módulos ativos',
      summary: 'Catálogo',
      description: 'Produtos e vendas direcionadas em destaque.',
    }
  }

  return {
    label: 'Módulos ativos',
    summary: 'Agenda',
    description: 'Agenda, clientes, serviços e disponibilidade.',
  }
}
