// app/dashboard/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth/useAuth'
import { isAdminRole } from '@/app/lib/helpers/utils'
import {
  DashboardHeader,
  QuickActionsCard,
  GlobalStatusGrid,
  ContextualHelpCard,
  ImportantLogbooksCard,
  RecentActivityCard,
  LogbookEntryDisplay,
  UnifiedActivity,
} from '@/app/components/dashboard'
import { activityApi } from '@/app/lib/activity'

export default function DashboardHome() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const { user: currentUser } = useAuth()
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntryDisplay[]>([])
  const [recentActivity, setRecentActivity] = useState<UnifiedActivity[]>([])
  const [loadingLogbooks, setLoadingLogbooks] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)

  const isUserAdmin = isAdminRole(currentUser?.role)

  // ========================================
  // DATE HELPERS
  // ========================================

  const getLocalDateString = useCallback((date: Date = new Date()): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const generateDateRange = useCallback(
    (daysBack: number): string[] => {
      const dates: string[] = []
      const today = new Date()

      for (let i = 0; i <= daysBack; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        dates.push(getLocalDateString(date))
      }

      return dates
    },
    [getLocalDateString]
  )

  // ========================================
  // FETCH IMPORTANT LOGBOOKS
  // ========================================

  const fetchLogbooksByPeriod = useCallback(
    async (period: 'today' | 'week' | 'month') => {
      setLoadingLogbooks(true)
      try {
        const { logbooksApi } = await import('@/app/lib/logbooks')

        let dates: string[] = []
        let startTimestamp: number
        let endTimestamp: number
        const today = new Date()

        if (period === 'today') {
          const todayStart = new Date(today)
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date(today)
          todayEnd.setHours(23, 59, 59, 999)

          startTimestamp = todayStart.getTime()
          endTimestamp = todayEnd.getTime()
          dates = [getLocalDateString(today)]
        } else if (period === 'week') {
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - 6)
          weekStart.setHours(0, 0, 0, 0)
          const weekEnd = new Date(today)
          weekEnd.setHours(23, 59, 59, 999)

          startTimestamp = weekStart.getTime()
          endTimestamp = weekEnd.getTime()
          dates = generateDateRange(6)
        } else {
          // month - mes calendario actual (día 1 hasta último día del mes)
          const year = today.getFullYear()
          const month = today.getMonth()
          const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

          const monthStart = new Date(year, month, 1)
          monthStart.setHours(0, 0, 0, 0)
          const monthEnd = new Date(year, month, lastDayOfMonth)
          monthEnd.setHours(23, 59, 59, 999)

          startTimestamp = monthStart.getTime()
          endTimestamp = monthEnd.getTime()

          // Generar todas las fechas del mes actual
          dates = []
          for (let day = 1; day <= lastDayOfMonth; day++) {
            const date = new Date(year, month, day)
            dates.push(getLocalDateString(date))
          }
        }

        const responses = await Promise.all(
          dates.map((date) => logbooksApi.getLogbooksByDay(date).catch(() => []))
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allLogbooks: any[] = responses.flat().filter(Boolean)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logbooksInPeriod = allLogbooks.filter((entry: any) => {
          const createdAt = new Date(entry.created_at).getTime()
          return createdAt >= startTimestamp && createdAt <= endTimestamp
        })

        // Filter HIGH (alta) and CRITICAL (urgente) priorities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const priorityLogbooks = logbooksInPeriod.filter((entry: any) => {
          const level = entry.importance_level?.toLowerCase()
          return level === 'urgente' || level === 'alta'
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entries: LogbookEntryDisplay[] = priorityLogbooks.map((entry: any) => {
          let priority: 'low' | 'medium' | 'high' | 'critical' = 'low'
          const level = entry.importance_level?.toLowerCase()

          // Map DB values to display values: urgente -> critical, alta -> high
          if (level === 'urgente') priority = 'critical'
          else if (level === 'alta') priority = 'high'
          else if (level === 'media') priority = 'medium'

          return {
            id: entry.id,
            timestamp: entry.created_at,
            author_name: entry.author_name || 'Unknown',
            description: entry.message,
            priority,
            status: (entry.is_solved === 1 ? 'resolved' : 'pending') as 'resolved' | 'pending',
            // Store department_id, we'll resolve the name at render time
            department_id: entry.department_id,
          }
        })

        // Sort by priority (critical first) then by date (newest first)
        const sortedEntries = entries.sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

          if (priorityDiff !== 0) return priorityDiff

          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          return dateB - dateA
        })

        setLogbookEntries(sortedEntries)
      } catch (error) {
        console.error('[Dashboard] Error fetching logbooks:', error)
        setLogbookEntries([])
      } finally {
        setLoadingLogbooks(false)
      }
    },
    [generateDateRange, getLocalDateString]
  )

  // ========================================
  // FETCH RECENT ACTIVITY
  // ========================================

  const fetchRecentActivity = useCallback(async () => {
    setLoadingActivity(true)
    try {
      const activities = await activityApi.getRecentActivity({ limit: 5 })
      setRecentActivity(activities)
    } catch (error) {
      console.error('[Dashboard] Error fetching activity:', error)
      setRecentActivity([])
    } finally {
      setLoadingActivity(false)
    }
  }, [])

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    fetchLogbooksByPeriod(selectedPeriod)
  }, [selectedPeriod, fetchLogbooksByPeriod])

  useEffect(() => {
    fetchRecentActivity()
  }, [fetchRecentActivity])

  // ========================================
  // HANDLERS
  // ========================================

  const handlePeriodChange = (period: 'today' | 'week' | 'month') => {
    setSelectedPeriod(period)
  }

  const handleRefreshLogbooks = () => {
    fetchLogbooksByPeriod(selectedPeriod)
  }

  const handleRefreshActivity = () => {
    fetchRecentActivity()
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] px-4 md:px-5 lg:px-6 pt-4 md:-mt-2 md:pt-0 pb-4">
      <div className="max-w-[1600px] space-y-4">
        {/* Header with Period Selector */}
        <DashboardHeader selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions, Global Status, Contextual Help */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Global Status */}
            <GlobalStatusGrid isUserAdmin={isUserAdmin} />

            {/* Contextual Help */}
            <ContextualHelpCard
              selectedPeriod={selectedPeriod}
              hasEntries={logbookEntries.length > 5}
            />
          </div>

          {/* Right Column - Important Logbooks & Recent Activity */}
          <div className="space-y-6">
            {/* Important Logbooks (HIGH & CRITICAL) */}
            <ImportantLogbooksCard
              entries={logbookEntries}
              loading={loadingLogbooks}
              selectedPeriod={selectedPeriod}
              onRefresh={handleRefreshLogbooks}
            />

            {/* Recent Activity (from unified API) */}
            <RecentActivityCard
              activities={recentActivity}
              loading={loadingActivity}
              onRefresh={handleRefreshActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
