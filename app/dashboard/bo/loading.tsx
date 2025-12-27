// app/dashboard/bo/loading.tsx
/**
 * Route-level Loading State
 *
 * Shown instantly while the page is loading (server-side data fetching).
 * Next.js automatically wraps page.tsx in a Suspense boundary with this fallback.
 */

'use client'

import { useTranslations } from 'next-intl'
import { StatsCardsSkeleton } from '@/app/components/bo/StatsCardsSkeleton'

export default function BackOfficeLoading() {
  const t = useTranslations('backoffice')

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1600px] space-y-5">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('loading.title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {t('loading.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <StatsCardsSkeleton />

        {/* Tab Navigation Skeleton */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex space-x-4 sm:space-x-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5 px-1 py-3 animate-pulse">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </nav>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4 mt-4">
          {/* Action bar skeleton */}
          <div className="flex flex-col lg:flex-row gap-3 animate-pulse">
            <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
            <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
            <div className="flex gap-2">
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="w-28 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
          </div>

          {/* Table skeleton (desktop) */}
          <div className="hidden lg:block bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {[...Array(9)].map((_, i) => (
                      <th key={i} className="px-3 py-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {[...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-3 py-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards skeleton */}
          <div className="lg:hidden space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 animate-pulse"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
