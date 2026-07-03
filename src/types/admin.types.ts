export type AdminRecentCompany = {
  id: number
  name: string
  ownerName: string
  status: string
  createdAt: string
}

export type AdminDashboardSummary = {
  totalCompanies: number
  activeCompanies: number
  blockedCompanies: number
  receivedThisMonth: number
  receivedThisMonthFormatted: string
  pendingThisMonth: number
  pendingThisMonthFormatted: string
  newCompaniesThisMonth: number
  totalAppointmentsThisMonth: number
  totalClients: number
  recentCompanies: AdminRecentCompany[]
}

export type AdminClientAppointmentMetric = {
  clientId?: number | string | null
  clientReference?: string | null
  clientLabel?: string | null
  appointmentsCount: number
}

export type AdminPeriodFilterType = 'date' | 'month'

export type AdminAppointmentAnalytics = {
  date?: string
  month?: string
  periodType?: AdminPeriodFilterType
  totalAppointments: number
  totalClientsWithAppointments: number
  averageAppointmentsPerClient?: number | null
  clientAppointmentCounts?: AdminClientAppointmentMetric[]
  clients?: AdminClientAppointmentMetric[]
  items?: AdminClientAppointmentMetric[]
}

export type AdminCompany = {
  id: number
  name: string
  ownerName: string
  email: string
  phone?: string | null
  document?: string | null
  logoUrl?: string | null
  publicSlug?: string | null
  status: string
  monthlyFee: number
  monthlyFeeFormatted: string
  notes?: string | null
  createdAt: string
  professionalsCount: number
  clientsCount: number
  servicesCount: number
  appointmentsCount: number
}

export type AdminBilling = {
  id: number
  companyId: number
  companyName: string
  referenceMonth: string
  amount: number
  amountFormatted: string
  dueDate: string
  paidAt?: string | null
  status: string
  paymentMethod?: string | null
  notes?: string | null
}

export type AdminUser = {
  id: number
  fullName: string
  businessName?: string | null
  email: string
  phone?: string | null
  specialty?: string | null
  role: string
  status: string
  createdAt: string
  publicSlug?: string | null
  timezone?: string | null
  hasAppointmentsModule: boolean
  hasCatalogModule: boolean
}
