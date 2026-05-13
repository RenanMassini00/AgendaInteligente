export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  register: '/register',

  dashboard: '/dashboard',
  appointments: '/appointments',
  createAppointment: '/appointments/new',

  clients: '/clients',
  createClient: '/clients/new',
  editClient: '/clients/:id/edit',

  services: '/services',
  createService: '/services/new',
  editService: '/services/:id/edit',

  catalog: '/catalog',
  createProduct: '/catalog/new',
  editProduct: '/catalog/:id/edit',

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
  catalogAccess: '/catalogo',
  publicCatalog: '/catalogo/:slug',
} as const