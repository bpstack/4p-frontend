// app/components/bo/StatsCardsSkeleton.tsx
/**
 * Client Component - Stats Cards Skeleton
 *
 * Loading skeleton for stats cards.
 * Separated from StatsCards to allow importing in Client Components.
 */

'use client'

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
