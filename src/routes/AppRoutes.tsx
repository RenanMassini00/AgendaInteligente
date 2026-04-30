import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AvailabilityPage from '../pages/AvailabilityPage'
import AppointmentsPage from '../pages/AppointmentsPage'
import ClientsPage from '../pages/ClientsPage'
import CreateAppointmentPage from '../pages/CreateAppointmentPage'
import CreateAvailabilityPage from '../pages/CreateAvailabilityPage'
import CreateClientPage from '../pages/CreateClientPage'
import CreateServicePage from '../pages/CreateServicePage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import ServicesPage from '../pages/ServicesPage'
import SettingsPage from '../pages/SettingsPage'
import { isAuthenticated } from '../utils/auth'
import { ROUTE_PATHS } from './routePaths'

export default function AppRoutes() {
  const location = useLocation()
  const authenticated = isAuthenticated()

  if (!authenticated && location.pathname !== ROUTE_PATHS.login) {
    return <Navigate to={ROUTE_PATHS.login} replace />
  }

  if (authenticated && location.pathname === ROUTE_PATHS.login) {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />
  }

  if (location.pathname === ROUTE_PATHS.login) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
      </Routes>
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
