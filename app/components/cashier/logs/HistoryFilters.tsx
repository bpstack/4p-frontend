// app/components/cashier/logs/HistoryFilters.tsx

'use client'

import { useTranslations } from 'next-intl'
import { FiSearch, FiDownload } from 'react-icons/fi'
import type { HistoryAction } from '@/app/lib/cashier/types'

interface HistoryFiltersProps {
  actionFilter: HistoryAction | 'all'
  onActionFilterChange: (action: HistoryAction | 'all') => void
  userFilter: string
  onUserFilterChange: (user: string) => void
  onExport: () => void
}

export default function HistoryFilters({
  actionFilter,
  onActionFilterChange,
  userFilter,
  onUserFilterChange,
  onExport,
}: HistoryFiltersProps) {
  const t = useTranslations('cashier')

  const actions: Array<{ value: HistoryAction | 'all'; label: string }> = [
    { value: 'all', label: t('logs.action') },
    { value: 'created', label: t('actions.created') },
    { value: 'updated', label: t('actions.updated') },
    { value: 'deleted', label: t('actions.deleted') },
    { value: 'status_changed', label: t('actions.status_changed') },
    { value: 'adjustment', label: t('actions.adjustment') },
    { value: 'voucher_created', label: t('actions.voucher_created') },
    { value: 'voucher_repaid', label: t('actions.voucher_repaid') },
    { value: 'daily_closed', label: t('actions.daily_closed') },
    { value: 'daily_reopened', label: t('actions.daily_reopened') },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Filtro de usuario (búsqueda) */}
      <div className="relative flex-1">
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder={t('logs.searchByUser')}
          value={userFilter}
          onChange={(e) => onUserFilterChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#151b23] dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      {/* Filtro de acción */}
      <select
        value={actionFilter}
        onChange={(e) => onActionFilterChange(e.target.value as HistoryAction | 'all')}
        className="w-full sm:w-auto sm:min-w-[140px] px-3 py-1.5 pr-8 text-xs border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent bg-white dark:bg-[#151b23] dark:text-gray-200"
      >
        {actions.map((action) => (
          <option key={action.value} value={action.value}>
            {action.label}
          </option>
        ))}
      </select>

      {/* Botón exportar */}
      <button
        onClick={onExport}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#151b23] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <FiDownload className="w-3.5 h-3.5" />
        {t('logs.export')}
      </button>
    </div>
  )
}
