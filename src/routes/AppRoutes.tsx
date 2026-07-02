import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ClientLayout from '../components/layout/ClientLayout'
import AvailabilityPage from '../pages/AvailabilityPage'
import AppointmentsPage from '../pages/AppointmentsPage'
import ClientsPage from '../pages/ClientsPage'
import CreateAppointmentPage from '../pages/CreateAppointmentPage'
import CreateAvailabilityPage from '../pages/CreateAvailabilityPage'
import CreateClientPage from '../pages/CreateClientPage'
import CreateProductPage from '../pages/CreateProductPage'
import CreateServicePage from '../pages/CreateServicePage'
import ClientAppointmentsPage from '../pages/ClientAppointmentsPage'
import ClientBookAppointmentPage from '../pages/ClientBookAppointmentPage'
import ClientHomePage from '../pages/ClientHomePage'
import ClientRegisterPage from '../pages/ClientRegisterPage'
import CatalogAccessPage from '../pages/CatalogAccessPage'
import DashboardPage from '../pages/DashboardPage'
import FinancePage from '../pages/FinancePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import PublicBookingPage from '../pages/PublicBookingPage'
import PublicCatalogPage from '../pages/PublicCatalogPage'
import RegisterPage from '../pages/RegisterPage'
import ServicesPage from '../pages/ServicesPage'
import CatalogPage from '../pages/CatalogPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminBillingPage from '../pages/admin/AdminBillingPage'
import AdminCompaniesPage from '../pages/admin/AdminCompaniesPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import SettingsPage from '../pages/SettingsPage'
import { getCurrentRole, isAuthenticated } from '../utils/auth'
import { ROUTE_PATHS } from './routePaths'
import PublicBookingSuccessPage from '../pages/PublicBookingSuccessPage'

export default function AppRoutes() {
  const location = useLocation()
  const authenticated = isAuthenticated()
  const role = getCurrentRole()

  const isPublicBookingPath = location.pathname.startsWith('/agendar/')
  const isPublicCatalogPath = location.pathname.startsWith('/catalogo/')

  const publicPaths: string[] = [
    ROUTE_PATHS.login,
    ROUTE_PATHS.register,
    ROUTE_PATHS.clientRegister,
    ROUTE_PATHS.catalogAccess,
  ]

  const isPublicPath = publicPaths.includes(location.pathname)

  if (isPublicBookingPath) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.publicBookingSuccess} element={<PublicBookingSuccessPage />} />
        <Route path={ROUTE_PATHS.publicBooking} element={<PublicBookingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    )
  }

  if (isPublicCatalogPath) {
    return (
      <Routes>
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

    if (role === 'client') {
      return <Navigate to={ROUTE_PATHS.clientHome} replace />
    }

    return <Navigate to={ROUTE_PATHS.dashboard} replace />
  }

  if (isPublicPath) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
        <Route path={ROUTE_PATHS.clientRegister} element={<ClientRegisterPage />} />
        <Route path={ROUTE_PATHS.catalogAccess} element={<CatalogAccessPage />} />
        <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
      </Routes>
    )
  }

  if (role === 'client') {
    return (
      <ClientLayout>
        <Routes>
          <Route path={ROUTE_PATHS.clientHome} element={<ClientHomePage />} />
          <Route path={ROUTE_PATHS.clientBook} element={<ClientBookAppointmentPage />} />
          <Route path={ROUTE_PATHS.clientAppointments} element={<ClientAppointmentsPage />} />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.clientHome} replace />} />
        </Routes>
      </ClientLayout>
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
          <Route path={ROUTE_PATHS.adminSettings} element={<SettingsPage />} />
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

        <Route path={ROUTE_PATHS.services} element={<ServicesPage />} />
        <Route path={ROUTE_PATHS.createService} element={<CreateServicePage />} />
        <Route path={ROUTE_PATHS.editService} element={<CreateServicePage />} />

        <Route path={ROUTE_PATHS.availability} element={<AvailabilityPage />} />
        <Route path={ROUTE_PATHS.createAvailability} element={<CreateAvailabilityPage />} />

        <Route path={ROUTE_PATHS.finance} element={<FinancePage />} />
        <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
        <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />

        <Route path={ROUTE_PATHS.catalog} element={<CatalogPage />} />
        <Route path={ROUTE_PATHS.createProduct} element={<CreateProductPage />} />
        <Route path={ROUTE_PATHS.editProduct} element={<CreateProductPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}
