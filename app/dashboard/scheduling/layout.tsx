// app/dashboard/scheduling/layout.tsx
// Admin-only route protection

'use client'

import { useAuth } from '@/app/lib/auth/useAuth'
import { isAdminRole } from '@/app/lib/helpers/utils'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SchedulingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to load
    if (loading) return

    // If no user or not admin, redirect to dashboard
    if (!user || !isAdminRole(user.role)) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#010409] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
        </div>
      </div>
    )
  }

  // If not admin, show nothing (redirect will happen)
  if (!user || !isAdminRole(user.role)) {
    return null
  }

  return <>{children}</>
}
