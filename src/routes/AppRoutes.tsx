import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ClientLayout from '../components/layout/ClientLayout'
import AvailabilityPage from '../pages/AvailabilityPage'
import AppointmentsPage from '../pages/AppointmentsPage'
import ClientAppointmentsPage from '../pages/ClientAppointmentsPage'
import ClientBookAppointmentPage from '../pages/ClientBookAppointmentPage'
import ClientHomePage from '../pages/ClientHomePage'
import ClientRegisterPage from '../pages/ClientRegisterPage'
import ClientsPage from '../pages/ClientsPage'
import CreateAppointmentPage from '../pages/CreateAppointmentPage'
import CreateAvailabilityPage from '../pages/CreateAvailabilityPage'
import CreateClientPage from '../pages/CreateClientPage'
import CreateServicePage from '../pages/CreateServicePage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import RegisterPage from '../pages/RegisterPage'
import ServicesPage from '../pages/ServicesPage'
import SettingsPage from '../pages/SettingsPage'
import { getCurrentRole, isAuthenticated } from '../utils/auth'
import { ROUTE_PATHS } from './routePaths'

export default function AppRoutes() {
  const location = useLocation()
  const authenticated = isAuthenticated()
  const role = getCurrentRole()

  const publicPaths: string[] = [ROUTE_PATHS.login, ROUTE_PATHS.register, ROUTE_PATHS.clientRegister]
  const isPublicPath = publicPaths.includes(location.pathname)

  if (!authenticated && !isPublicPath) {
    return <Navigate to={ROUTE_PATHS.login} replace />
  }

  if (authenticated && isPublicPath) {
    return <Navigate to={role === 'client' ? ROUTE_PATHS.clientHome : ROUTE_PATHS.dashboard} replace />
  }

  if (role === 'client' && !location.pathname.startsWith('/client')) {
    return <Navigate to={ROUTE_PATHS.clientHome} replace />
  }

  if (role === 'professional' && location.pathname.startsWith('/client')) {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />
  }

  if (isPublicPath) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
        <Route path={ROUTE_PATHS.clientRegister} element={<ClientRegisterPage />} />
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
        <Route path={ROUTE_PATHS.availability} element={<AvailabilityPage />} />
        <Route path={ROUTE_PATHS.createAvailability} element={<CreateAvailabilityPage />} />
        <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
        <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}
