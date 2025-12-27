'use client'

import { useTranslations } from 'next-intl'
import { FiClock } from 'react-icons/fi'

interface StatusBadgeProps {
  status: string
}

export function StatusBadgeSpot({ status }: StatusBadgeProps) {
  const t = useTranslations('parking.spotStatus')

  switch (status) {
    case 'checked_in':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800">
          <span className="w-2 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-pulse" />
          {t('checked_in')}
        </span>
      )
    case 'reserved':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
          <FiClock className="w-3 h-3" />
          {t('reserved')}
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
          {t('free')}
        </span>
      )
  }
}

// Backward compatibility - deprecated, use StatusBadgeSpot component instead
export function getStatusBadge(status: string) {
  // This function is kept for backward compatibility but will not support i18n
  // Migrate to <StatusBadgeSpot status={status} /> component instead
  switch (status) {
    case 'checked_in':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800">
          <span className="w-2 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-pulse" />
          Aparcado
        </span>
      )
    case 'reserved':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
          <FiClock className="w-3 h-3" />
          Reservado
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
          Disponible
        </span>
      )
  }
}
