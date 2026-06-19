import { Navigate, Route, Routes } from 'react-router'
import AdminLogin from './AdminLogin'
import AdminLayout from './AdminLayout'
import AdminDashboard from './AdminDashboard'
import AdminUsers from './AdminUsers'
import AdminModeration from './AdminModeration'
import AdminGuard from './AdminGuard'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="moderation" element={<AdminModeration />} />
      </Route>
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  )
}
