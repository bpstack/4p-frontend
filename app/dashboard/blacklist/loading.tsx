// app/dashboard/blacklist/loading.tsx
/**
 * Route-level Loading State for Blacklist
 */

function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="space-y-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </td>
      <td className="px-3 py-2">
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </td>
      <td className="px-3 py-2">
        <div className="space-y-1">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
      </td>
    </tr>
  )
}

function MobileCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  )
}

export default function BlacklistLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1400px] space-y-5">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-5">
          {/* Left Column - Main Content */}
          <div className="min-[1400px]:col-span-3 space-y-4">
            {/* Stats - Mobile/Tablet */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 min-[1400px]:hidden">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 animate-pulse">
              <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="w-full sm:w-36 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="w-full sm:w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>

            {/* Table - Desktop */}
            <div className="hidden md:block bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <th key={i} className="px-3 py-2">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {[...Array(8)].map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - Mobile */}
            <div className="md:hidden space-y-2">
              {[...Array(5)].map((_, i) => (
                <MobileCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Right Column - Stats Sidebar */}
          <div className="hidden min-[1400px]:block space-y-4">
            <div className="sticky top-4 space-y-3">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
