// app/dashboard/cashier/logs/page.tsx
'use client'

import { useTranslations } from 'next-intl'
import { useCashierStore, useLogsFilters } from '@/app/stores/useCashierStore'
import DateNavigator from '@/app/components/cashier/DateNavigator'
import HistoryTable from '@/app/components/cashier/logs/HistoryTable'
import LogsSummarySidebar from '@/app/components/cashier/layout/LogsSummarySidebar'
import HistoryFilters from '@/app/components/cashier/logs/HistoryFilters'
import { useHistoryLogs, useHistoryStats } from '@/app/lib/cashier/queries'
import { FiActivity, FiUsers, FiList } from 'react-icons/fi'

export default function LogsPage() {
  const t = useTranslations('cashier')

  // Zustand store
  const {
    logsDate,
    getLogsFormattedDate,
    logsGoToPreviousDay,
    logsGoToNextDay,
    logsGoToToday,
    setLogsActionFilter,
    setLogsUserFilter,
    logsNextPage,
    logsPreviousPage,
  } = useCashierStore()

  const { actionFilter, userFilter, limit, offset } = useLogsFilters()

  // Queries
  const { data: logsResponse, isLoading: logsLoading } = useHistoryLogs({
    from_date: logsDate,
    to_date: logsDate,
    action: actionFilter === 'all' ? undefined : actionFilter,
    changed_by: userFilter || undefined,
    limit,
    offset,
  })

  const { data: statsResponse, isLoading: statsLoading } = useHistoryStats({
    from_date: logsDate,
    to_date: logsDate,
  })

  // Extraer data de las respuestas
  const logsData = logsResponse?.data || []
  const statsData = statsResponse?.data

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Exportar logs')
  }

  // Helper para labels de acciones
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

  // Top stats para mobile
  const topUsers = statsData?.most_active_users?.slice(0, 2) || []
  const topActions =
    statsData?.actions_breakdown
      ?.sort((a: { count: number }, b: { count: number }) => b.count - a.count)
      .slice(0, 2) || []

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1400px] space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('logs.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {t('logs.pageSubtitle')}
            </p>
          </div>

          <DateNavigator
            displayLabel={getLogsFormattedDate()}
            onPrevious={logsGoToPreviousDay}
            onNext={logsGoToNextDay}
            onToday={logsGoToToday}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-5">
          {/* Left Column - Main Content */}
          <div className="min-[1400px]:col-span-3 space-y-4">
            {/* Stats - Mobile/Tablet (hidden on >= 1400px) */}
            {!statsLoading && statsData && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 min-[1400px]:hidden">
                {/* Total Registros */}
                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('logs.totalRecords')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {statsData.total_entries}
                      </p>
                    </div>
                    <FiActivity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>

                {/* Usuarios Activos */}
                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('logs.activeUsers')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {topUsers.length}
                      </p>
                    </div>
                    <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400" />
                  </div>
                </div>

                {/* Top Acción */}
                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('logs.frequentAction')}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {topActions[0] ? getActionLabel(topActions[0].action) : '-'}
                      </p>
                    </div>
                    <FiList className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Filtros */}
            <HistoryFilters
              actionFilter={actionFilter}
              onActionFilterChange={setLogsActionFilter}
              userFilter={userFilter}
              onUserFilterChange={setLogsUserFilter}
              onExport={handleExport}
            />

            {/* Tabla de logs */}
            <HistoryTable
              logs={logsData}
              isLoading={logsLoading}
              offset={offset}
              limit={limit}
              onNextPage={logsNextPage}
              onPreviousPage={logsPreviousPage}
            />
          </div>

          {/* Right Column - Summary Sidebar (visible on >= 1400px) */}
          <div className="hidden min-[1400px]:block">
            <LogsSummarySidebar stats={statsData || null} isLoading={statsLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
