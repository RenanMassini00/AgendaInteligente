import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AvailabilityPage from '../pages/AvailabilityPage'
import AppointmentsPage from '../pages/AppointmentsPage'
import CatalogAccessPage from '../pages/CatalogAccessPage'
import CatalogPage from '../pages/CatalogPage'
import ClientsPage from '../pages/ClientsPage'
import CreateAppointmentPage from '../pages/CreateAppointmentPage'
import CreateAvailabilityPage from '../pages/CreateAvailabilityPage'
import CreateClientPage from '../pages/CreateClientPage'
import CreateProductPage from '../pages/CreateProductPage'
import CreateServicePage from '../pages/CreateServicePage'
import DashboardPage from '../pages/DashboardPage'
import FinancePage from '../pages/FinancePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import PublicBookingPage from '../pages/PublicBookingPage'
import PublicCatalogPage from '../pages/PublicCatalogPage'
import RegisterPage from '../pages/RegisterPage'
import ServicesPage from '../pages/ServicesPage'
import SettingsPage from '../pages/SettingsPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminBillingPage from '../pages/admin/AdminBillingPage'
import AdminCompaniesPage from '../pages/admin/AdminCompaniesPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import { getCurrentRole, isAuthenticated } from '../utils/auth'
import { ROUTE_PATHS } from './routePaths'

export default function AppRoutes() {
  const location = useLocation()
  const authenticated = isAuthenticated()
  const role = getCurrentRole()

  const pathname = location.pathname

  const isPublicBookingPath = pathname.startsWith('/agendar/')
  const isCatalogAccessPath = pathname === '/catalogo' || pathname === '/catalogo/'
  const isPublicCatalogPath = pathname.startsWith('/catalogo/')

  const publicPaths: string[] = [
    ROUTE_PATHS.login,
    ROUTE_PATHS.register,
    ROUTE_PATHS.catalogAccess,
  ]

  const isPublicPath = publicPaths.includes(pathname)

  if (isPublicBookingPath) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.publicBooking} element={<PublicBookingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    )
  }

  if (isCatalogAccessPath || isPublicCatalogPath) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.catalogAccess} element={<CatalogAccessPage />} />
        <Route path={ROUTE_PATHS.publicCatalog} element={<PublicCatalogPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    )
  }

  if (!authenticated && !isPublicPath) {
    return <Navigate to={ROUTE_PATHS.login} replace />
  }

  if (authenticated && isPublicPath) {
    if (role === 'master_admin') {
      return <Navigate to={ROUTE_PATHS.adminDashboard} replace />
    }

    return <Navigate to={ROUTE_PATHS.dashboard} replace />
  }

  if (isPublicPath) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
        <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
      </Routes>
    )
  }

  if (role === 'master_admin') {
    return (
      <AppLayout>
        <Routes>
          <Route path={ROUTE_PATHS.adminDashboard} element={<AdminDashboardPage />} />
          <Route path={ROUTE_PATHS.adminCompanies} element={<AdminCompaniesPage />} />
          <Route path={ROUTE_PATHS.adminUsers} element={<AdminUsersPage />} />
          <Route path={ROUTE_PATHS.adminBilling} element={<AdminBillingPage />} />
          <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.adminDashboard} replace />} />
        </Routes>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path={ROUTE_PATHS.root} element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
        <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />

        <Route path={ROUTE_PATHS.appointments} element={<AppointmentsPage />} />
        <Route path={ROUTE_PATHS.createAppointment} element={<CreateAppointmentPage />} />

        <Route path={ROUTE_PATHS.clients} element={<ClientsPage />} />
        <Route path={ROUTE_PATHS.createClient} element={<CreateClientPage />} />
        <Route path={ROUTE_PATHS.editClient} element={<CreateClientPage />} />

        <Route path={ROUTE_PATHS.services} element={<ServicesPage />} />
        <Route path={ROUTE_PATHS.createService} element={<CreateServicePage />} />
        <Route path={ROUTE_PATHS.editService} element={<CreateServicePage />} />

        <Route path={ROUTE_PATHS.catalog} element={<CatalogPage />} />
        <Route path={ROUTE_PATHS.createProduct} element={<CreateProductPage />} />
        <Route path={ROUTE_PATHS.editProduct} element={<CreateProductPage />} />

        <Route path={ROUTE_PATHS.availability} element={<AvailabilityPage />} />
        <Route path={ROUTE_PATHS.createAvailability} element={<CreateAvailabilityPage />} />

        <Route path={ROUTE_PATHS.finance} element={<FinancePage />} />
        <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
        <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}