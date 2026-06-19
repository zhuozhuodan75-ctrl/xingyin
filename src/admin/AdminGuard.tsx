import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { ensureAdminAccess } from '@/lib/adminAuth'

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    void ensureAdminAccess().then(ok => {
      setAllowed(ok)
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="w-8 h-8 border-2 border-[#2D5016] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
