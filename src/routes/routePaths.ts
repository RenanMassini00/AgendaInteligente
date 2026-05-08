export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  register: '/register',

  dashboard: '/dashboard',
  appointments: '/appointments',
  createAppointment: '/appointments/new',
  clients: '/clients',
  createClient: '/clients/new',
  services: '/services',
  createService: '/services/new',
  availability: '/availability',
  createAvailability: '/availability/new',
  finance: '/finance',
  profile: '/profile',
  settings: '/settings',

  adminDashboard: '/admin/dashboard',
  adminCompanies: '/admin/companies',
  adminUsers: '/admin/users',
  adminBilling: '/admin/billing',

  publicBooking: '/agendar/:slug',
} as const