import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Public
import Home     from './pages/Home'
import Login    from './pages/Login'
import Register from './pages/Register'

// Shared
import Chatbot  from './pages/Chatbot'
import Account  from './pages/Account'

// Admin
import Layout           from './components/common/Layout'
import Dashboard        from './pages/Dashboard'
import Users            from './pages/Users'
import Reports          from './pages/Reports'
import Investigations   from './pages/Investigations'
import ActivityLogs     from './pages/ActivityLogs'
import Analytics        from './pages/Analytics'

// Doctor
import DoctorLayout        from './components/common/DoctorLayout'
import DoctorDashboard     from './pages/doctor/DoctorDashboard'
import PendingReviews      from './pages/doctor/PendingReviews'
import DoctorInvestigations from './pages/doctor/DoctorInvestigations'
import DoctorAnalytics     from './pages/doctor/DoctorAnalytics'

// Athlete
import AthleteLayout    from './components/common/AthleteLayout'
import AthleteDashboard from './pages/athlete/AthleteDashboard'
import AthleteProfile   from './pages/athlete/AthleteProfile'
import UploadReport     from './pages/athlete/UploadReport'
import MyReports        from './pages/athlete/MyReports'
import MyCases          from './pages/athlete/MyCases'

import ProtectedRoute from './components/common/ProtectedRoute'

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/home" replace />
  if (user?.role === 'admin')   return <Navigate to="/admin/dashboard" replace />
  if (user?.role === 'doctor')  return <Navigate to="/doctor/dashboard" replace />
  if (user?.role === 'athlete') return <Navigate to="/athlete/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public */}
        <Route path="/home"     element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── ADMIN ── */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="users"          element={<Users />} />
          <Route path="reports"        element={<Reports />} />
          <Route path="investigations" element={<Investigations />} />
          <Route path="activity-logs"  element={<ActivityLogs />} />
          <Route path="analytics"      element={<Analytics />} />
          <Route path="chatbot"        element={<Chatbot />} />
          <Route path="account"        element={<Account />} />
        </Route>

        {/* ── DOCTOR ── */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorLayout /></ProtectedRoute>}>
          <Route path="dashboard"       element={<DoctorDashboard />} />
          <Route path="pending-reviews" element={<PendingReviews />} />
          <Route path="investigations"  element={<DoctorInvestigations />} />
          <Route path="analytics"       element={<DoctorAnalytics />} />
        </Route>

        {/* ── ATHLETE ── */}
        <Route path="/athlete" element={<ProtectedRoute roles={['athlete']}><AthleteLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AthleteDashboard />} />
          <Route path="upload"    element={<UploadReport />} />
          <Route path="reports"   element={<MyReports />} />
          <Route path="cases"     element={<MyCases />} />
          <Route path="profile"   element={<AthleteProfile />} />
        </Route>

        {/* ── SHARED (authenticated) ── */}
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

        {/* Legacy admin routes */}
        <Route path="/dashboard"      element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/users"          element={<Navigate to="/admin/users" replace />} />
        <Route path="/reports"        element={<Navigate to="/admin/reports" replace />} />
        <Route path="/investigations" element={<Navigate to="/admin/investigations" replace />} />
        <Route path="/activity-logs"  element={<Navigate to="/admin/activity-logs" replace />} />
        <Route path="/analytics"      element={<Navigate to="/admin/analytics" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
