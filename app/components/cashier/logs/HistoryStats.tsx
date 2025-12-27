// app/components/cashier/logs/HistoryStats.tsx

'use client'

import { useTranslations } from 'next-intl'
import { FiActivity, FiUsers, FiList } from 'react-icons/fi'
import type { HistoryStats as HistoryStatsType } from '@/app/lib/cashier/types'

interface HistoryStatsProps {
  stats: HistoryStatsType
}

export default function HistoryStats({ stats }: HistoryStatsProps) {
  const t = useTranslations('cashier')

  // ✅ Validar que stats y sus propiedades existan
  if (!stats || !stats.most_active_users || !stats.actions_breakdown || !stats.recent_activity) {
    return null
  }

  // Top 3 usuarios más activos
  const topUsers = stats.most_active_users.slice(0, 3)

  // Top 3 acciones más frecuentes
  const topActions = stats.actions_breakdown.sort((a, b) => b.count - a.count).slice(0, 3)

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      created: t('actions.created'),
      updated: t('actions.updated'),
      deleted: t('actions.deleted'),
      status_changed: t('actions.status_changed'),
      adjustment: t('actions.adjustment'),
      voucher_created: t('actions.voucher_created'),
      voucher_repaid: t('actions.voucher_repaid'),
      daily_closed: t('actions.daily_closed'),
      daily_reopened: t('actions.daily_reopened'),
    }
    return labels[action] || action
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total de Entradas */}
      <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('logs.totalRecords')}
          </h3>
          <FiActivity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {stats.total_entries}
        </p>
        <div className="space-y-1">
          {topActions.map((action) => (
            <div key={action.action} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {getActionLabel(action.action)}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{action.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usuarios Más Activos */}
      <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('logs.activeUsers')}
          </h3>
          <FiUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-3">
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div key={user.user_id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.actions_count} {t('logs.action').toLowerCase()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              {t('logs.noActivity')}
            </p>
          )}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('logs.recentActivity')}
          </h3>
          <FiList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="space-y-3">
          {stats.recent_activity.slice(0, 3).map((activity) => (
            <div key={activity.id} className="border-l-2 border-blue-500 pl-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {getActionLabel(activity.action)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.changed_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {activity.username || t('logs.system')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
