// app/components/dashboard/RecentActivityCard.tsx
'use client'

import React, { useMemo, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { FiActivity, FiRefreshCw } from 'react-icons/fi'
import { FaCar } from 'react-icons/fa'
import { FiUsers, FiBook, FiTool } from 'react-icons/fi'

export type ActivitySource = 'cashier' | 'groups' | 'logbook' | 'maintenance'

export interface UnifiedActivity {
  id: string
  source: ActivitySource
  action: string
  user_id: string
  username: string
  timestamp: string
  record_id: string | number | null
}

interface RecentActivityCardProps {
  activities: UnifiedActivity[]
  loading: boolean
  onRefresh?: () => void
}

// Colores por fuente
const sourceColors: Record<ActivitySource, string> = {
  cashier: 'from-emerald-500 to-emerald-600',
  groups: 'from-orange-500 to-orange-600',
  logbook: 'from-blue-500 to-blue-600',
  maintenance: 'from-yellow-500 to-yellow-600',
}

// Iconos por fuente
const SourceIcon: React.FC<{ source: ActivitySource; className?: string }> = ({
  source,
  className,
}) => {
  const iconClass = className || 'w-3 h-3'
  switch (source) {
    case 'cashier':
      return <FaCar className={iconClass} />
    case 'groups':
      return <FiUsers className={iconClass} />
    case 'logbook':
      return <FiBook className={iconClass} />
    case 'maintenance':
      return <FiTool className={iconClass} />
  }
}

export function RecentActivityCard({ activities, loading, onRefresh }: RecentActivityCardProps) {
  const t = useTranslations('dashboard.recentActivity')
  const locale = useLocale()
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US'

  const sourceNames = useMemo(
    () => ({
      cashier: t('sources.cashier'),
      groups: t('sources.groups'),
      logbook: t('sources.logbook'),
      maintenance: t('sources.maintenance'),
    }),
    [t]
  )

  const translateAction = useCallback(
    (source: ActivitySource, action: string): string => {
      // Try to get the specific action translation, fall back to default
      const key = `actions.${source}.${action}`
      const defaultKey = `actions.${source}.default`
      const translation = t(key as never)
      // If translation equals the key, it means it wasn't found
      if (translation === key || translation.startsWith('actions.')) {
        return t(defaultKey as never)
      }
      return translation
    },
    [t]
  )

  const formatTimestamp = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp)
      const now = new Date()

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return timestamp // Retornar el timestamp original si no es válido
      }

      const time = date.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' })

      // Normalizar fechas a medianoche en zona local para comparación correcta
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const diffTime = today.getTime() - targetDate.getTime()
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      // Si es hoy
      if (diffDays === 0) {
        return `${t('time.today')}, ${time}`
      }

      // Si es ayer
      if (diffDays === 1) {
        return `${t('time.yesterday')}, ${time}`
      }

      // Si es dentro de la última semana (2-6 días atrás)
      if (diffDays >= 2 && diffDays < 7) {
        const dayName = date.toLocaleDateString(localeCode, { weekday: 'long' })
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)
        return `${capitalizedDay}, ${time}`
      }

      // Datos para fecha más antigua
      const day = date.getDate()
      const month = date.toLocaleDateString(localeCode, { month: 'short' })
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
      const year = date.getFullYear()
      const currentYear = now.getFullYear()

      // Si es de este año, mostrar día y mes
      if (year === currentYear) {
        return `${day} ${capitalizedMonth}, ${time}`
      }

      // Si es de otro año, incluir el año
      return `${day} ${capitalizedMonth} ${year}, ${time}`
    },
    [localeCode, t]
  )

  return (
    <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <FiActivity className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-sm font-bold text-[#24292f] dark:text-[#f0f6fc]">{t('title')}</h2>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors disabled:opacity-50"
            title={t('refresh')}
          >
            <FiRefreshCw
              className={`w-4 h-4 text-[#57606a] dark:text-[#8b949e] ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-6 h-6 bg-[#d0d7de] dark:bg-[#30363d] rounded-full mt-1" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#d0d7de] dark:bg-[#21262d] rounded w-3/4" />
                <div className="h-2.5 bg-[#d0d7de] dark:bg-[#21262d] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm font-medium text-[#57606a] dark:text-[#8b949e]">
            {t('noActivity')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors duration-150"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`w-6 h-6 flex items-center justify-center bg-gradient-to-br ${sourceColors[activity.source]} rounded-full shadow-sm`}
                >
                  <SourceIcon source={activity.source} className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#24292f] dark:text-[#f0f6fc]">
                    {translateAction(activity.source, activity.action)}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f6f8fa] dark:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] font-medium">
                    {sourceNames[activity.source]}
                  </span>
                </div>
                <p className="text-xs text-[#57606a] dark:text-[#8b949e]">{activity.username}</p>
                <p className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-0.5 font-medium">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
