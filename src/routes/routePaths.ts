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

  availability: '/availability',
  createAvailability: '/availability/new',

  profile: '/profile',
  settings: '/settings',

  publicBooking: '/agendar/:slug',
} as const