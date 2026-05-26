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

  catalog: '/catalog',
  createProduct: '/catalog/new',
  editProduct: '/catalog/:id/edit',
  catalogAccess: '/catalog-access',
  publicCatalog: '/catalogo/:slug',

  publicBooking: '/agendar/:slug',
  publicBookingSuccess: '/agendar/:slug/sucesso',

  adminDashboard: '/admin/dashboard',
  adminCompanies: '/admin/companies',
  adminUsers: '/admin/users',
  adminBilling: '/admin/billing',
  adminSettings: '/admin/settings',
} as const
