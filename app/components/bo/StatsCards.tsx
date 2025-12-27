// app/components/bo/StatsCards.tsx
/**
 * Server Component - Stats Cards
 *
 * Fetches and displays summary statistics.
 * Runs on the server, no JavaScript sent to client.
 *
 * Note: StatsCardsSkeleton is in a separate file (StatsCardsSkeleton.tsx)
 * to allow importing in Client Components without bundling server-only code.
 */

import { getTranslations } from 'next-intl/server'
import { getStats } from '@/app/lib/backoffice/data'
import { formatCurrency } from '@/app/lib/backoffice/types'
import {
  FiFileText,
  FiCheckCircle,
  FiUsers,
  FiDollarSign,
  FiAlertCircle,
  FiTrendingUp,
} from 'react-icons/fi'

export async function StatsCards() {
  const stats = await getStats()
  const t = await getTranslations('backoffice')

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
      {/* Pending Invoices */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('stats.pendingInvoices')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {stats.pending_count}
            </p>
          </div>
          <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 dark:text-yellow-400" />
        </div>
      </div>

      {/* Total Pending */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('stats.pendingTotal')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mt-0.5">
              {formatCurrency(stats.pending_total)}
            </p>
          </div>
          <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 dark:text-orange-400" />
        </div>
      </div>

      {/* Overdue */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('stats.overdue')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
              {stats.overdue_count}
            </p>
          </div>
          <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
        </div>
      </div>

      {/* Paid (Month) */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('stats.paidMonth')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {stats.paid_this_month}
            </p>
          </div>
          <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400" />
        </div>
      </div>

      {/* Total Paid (History) */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('stats.paidTotal')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
              {formatCurrency(stats.paid_total)}
            </p>
          </div>
          <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400" />
        </div>
      </div>

      {/* Suppliers */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('stats.suppliers')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {stats.suppliers_count}
            </p>
          </div>
          <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
        </div>
      </div>
    </div>
  )
}
