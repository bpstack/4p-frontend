// app/components/groups/tabs/HistoryTab.tsx

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGroupStore } from '@/app/stores/useGroupStore'
import { groupsApi, GroupHistoryRecord, HistoryAction } from '@/app/lib/groups'
import { HistoryItem } from '../history/HistoryItem'
import { EmptyState } from '../shared/EmptyState'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { FiClock, FiFilter } from 'react-icons/fi'

export function HistoryTab() {
  const { currentGroup } = useGroupStore()
  const [history, setHistory] = useState<GroupHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const t = useTranslations('groups')

  const ACTION_FILTERS = [
    { value: 'all', label: t('history.filterAll') },
    { value: HistoryAction.CREATED, label: t('history.filterCreated') },
    { value: HistoryAction.UPDATED, label: t('history.filterUpdated') },
    { value: HistoryAction.DELETED, label: t('history.filterDeleted') },
    { value: HistoryAction.STATUS_CHANGED, label: t('history.filterStatus') },
    { value: HistoryAction.PAYMENT_UPDATED, label: t('history.filterPayments') },
  ]

  useEffect(() => {
    if (currentGroup) {
      loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroup])

  const loadHistory = async () => {
    if (!currentGroup) return

    try {
      setIsLoading(true)
      const response = await groupsApi.getHistory(currentGroup.id)
      setHistory(response.data || [])
    } catch (error) {
      console.error('Error loading history:', error)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" message={t('history.loadingHistory')} />
      </div>
    )
  }

  const filteredHistory =
    filter === 'all' ? history : history.filter((record) => record.action === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            {t('history.historyTitle')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('history.historySubtitle')}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#151b23] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ACTION_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={<FiClock className="w-12 h-12" />}
          title={filter === 'all' ? t('history.noHistory') : t('history.noChangesOfType')}
          description={
            filter === 'all' ? t('history.noHistoryDesc') : t('history.tryAnotherFilter')
          }
        />
      ) : (
        <div className="relative">
          {filteredHistory.map((record) => (
            <HistoryItem key={record.id} record={record} />
          ))}
        </div>
      )}

      {/* Stats */}
      {history.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            {t('history.totalChanges')} {history.length} {t('history.records')}
            {filter !== 'all' && ` (${filteredHistory.length} ${t('history.filtered')})`}
          </p>
        </div>
      )}
    </div>
  )
}
