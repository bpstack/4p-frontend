// app/dashboard/parking/page.tsx
// Server Component - Pre-fetches 'today' stats for SSR

import { Suspense } from 'react'
import { getParkingDashboardStats } from './actions/getParkingDashboardStats'
import ParkingDashboardClient from './components/ParkingDashboardClient'

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] px-4 md:px-5 lg:px-6 pt-4 md:-mt-2 md:pt-0 pb-4">
      <div className="max-w-[1600px] space-y-5">
        {/* Skeleton Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 bg-gray-200 dark:bg-[#21262d] rounded-lg animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-36 bg-gray-200 dark:bg-[#21262d] rounded-lg animate-pulse"></div>
          </div>
          <div className="h-3 w-48 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse mt-2 sm:hidden"></div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5 h-64 animate-pulse"></div>
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5 h-48 animate-pulse"></div>
          </div>
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5 h-48 animate-pulse"></div>
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5 h-48 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ParkingDashboard() {
  let initialStats = undefined
  let initialOccupancy = undefined

  try {
    const response = await getParkingDashboardStats('today')
    initialStats = response.dashboard?.stats
    initialOccupancy = response.dashboard?.occupancy
  } catch (error) {
    console.error('[ParkingDashboard] Error fetching initial stats:', error)
    // El componente client manejará la carga si no hay datos iniciales
  }

  return (
    <Suspense fallback={<DashboardLoading />}>
      <ParkingDashboardClient initialStats={initialStats} initialOccupancy={initialOccupancy} />
    </Suspense>
  )
}
