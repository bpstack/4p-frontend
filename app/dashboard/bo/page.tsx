// app/dashboard/bo/page.tsx
/**
 * Back Office Page - Server Component
 *
 * Fetches all initial data on the server and passes to client components.
 * Uses Next.js caching and revalidation for optimal performance.
 */

import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import {
  getStats,
  getCategories,
  getPendingInvoices,
  getPaidInvoices,
  getSuppliers,
  getAssets,
} from '@/app/lib/backoffice/data'
import { StatsCards } from '@/app/components/bo/StatsCards'
import { StatsCardsSkeleton } from '@/app/components/bo/StatsCardsSkeleton'
import { TabsNavigation } from '@/app/components/bo/TabsNavigation'
import { TabContent } from '@/app/components/bo/TabContent'

// Force dynamic rendering since we're fetching user-specific data
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BackOfficePage({ searchParams }: PageProps) {
  // Await searchParams as per Next.js 15 requirements
  const params = await searchParams
  const paidPage = params.paidPage ? parseInt(params.paidPage as string, 10) : 1
  const suppliersPage = params.suppliersPage ? parseInt(params.suppliersPage as string, 10) : 1

  // Fetch all data in parallel on the server
  const [stats, categories, pendingData, paidData, suppliersData, assets, t] = await Promise.all([
    getStats(),
    getCategories(),
    getPendingInvoices(),
    getPaidInvoices(paidPage, 50),
    getSuppliers(suppliersPage, 100),
    getAssets(),
    getTranslations('backoffice'),
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1600px] space-y-5">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Server Component with Suspense */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>

        {/* Tab Navigation - Client Component */}
        <Suspense fallback={<TabsNavigationSkeleton />}>
          <TabsNavigation pendingCount={stats.pending_count} />
        </Suspense>

        {/* Tab Content - Client Component with server data */}
        <Suspense fallback={<TabContentSkeleton />}>
          <TabContent
            pendingInvoices={pendingData.invoices}
            paidInvoices={paidData.invoices}
            suppliers={suppliersData.suppliers}
            categories={categories}
            assets={assets}
            pendingPagination={pendingData.pagination}
            paidPagination={paidData.pagination}
            suppliersPagination={suppliersData.pagination}
          />
        </Suspense>
      </div>
    </div>
  )
}

// Loading skeletons for Suspense boundaries

function TabsNavigationSkeleton() {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex space-x-4 sm:space-x-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 px-1 py-3 animate-pulse">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </nav>
    </div>
  )
}

function TabContentSkeleton() {
  return (
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

      {/* Table skeleton */}
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
  )
}
