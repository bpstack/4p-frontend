// app/dashboard/parking/loading.tsx
/**
 * Route-level Loading State for Parking Dashboard
 * Shows skeleton UI while parking data is being fetched
 */

export default function ParkingLoading() {
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
            {/* Stats Card */}
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Occupancy Chart */}
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5 h-48 animate-pulse">
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>

          <div className="space-y-5">
            {/* Today's Activity */}
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5">
              <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl p-5">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
