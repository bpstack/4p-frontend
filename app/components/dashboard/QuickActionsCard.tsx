// app/components/dashboard/QuickActionsCard.tsx
'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { FiZap, FiBook, FiTool, FiUsers } from 'react-icons/fi'
import { FaCar } from 'react-icons/fa'
import { IconType } from 'react-icons'

interface QuickAction {
  labelKey: string
  shortLabelKey: string
  icon: IconType
  href: string
  color: string
}

const quickActionsConfig: QuickAction[] = [
  {
    labelKey: 'newLogbook',
    shortLabelKey: 'newLogbookShort',
    icon: FiBook,
    href: '/dashboard/logbooks',
    color: 'from-blue-500 to-blue-600',
  },
  {
    labelKey: 'newParking',
    shortLabelKey: 'newParkingShort',
    icon: FaCar,
    href: '/dashboard/parking/bookings/new',
    color: 'from-purple-500 to-purple-600',
  },
  {
    labelKey: 'maintenance',
    shortLabelKey: 'maintenanceShort',
    icon: FiTool,
    href: '/dashboard/maintenance',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    labelKey: 'newGroup',
    shortLabelKey: 'newGroupShort',
    icon: FiUsers,
    href: '/dashboard/groups?panel=create-group',
    color: 'from-orange-500 to-orange-600',
  },
]

export function QuickActionsCard() {
  const t = useTranslations('dashboard.quickActions')

  const quickActions = useMemo(
    () =>
      quickActionsConfig.map((action) => ({
        ...action,
        label: t(action.labelKey),
        shortLabel: t(action.shortLabelKey),
      })),
    [t]
  )

  return (
    <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-5">
        <FiZap className="w-4 h-4 sm:w-5 sm:h-5 text-[#0969da] dark:text-[#58a6ff]" />
        <h2 className="text-sm sm:text-lg font-bold text-[#24292f] dark:text-[#f0f6fc]">
          {t('title')}
        </h2>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {quickActions.map((action) => (
          <a
            key={action.labelKey}
            href={action.href}
            className="group relative overflow-hidden p-2 sm:p-5 bg-gradient-to-br from-[#f6f8fa] to-white dark:from-[#161B22] dark:to-[#161b22] border border-[#d0d7de] dark:border-[#21262d] rounded-xl hover:border-[#0969da] dark:hover:border-[#58a6ff] hover:shadow-lg transition-all duration-300 sm:transform sm:hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
              <div
                className={`p-2 sm:p-3 bg-gradient-to-br ${action.color} rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] leading-tight group-hover:text-[#0969da] dark:group-hover:text-[#58a6ff] transition-colors">
                <span className="sm:hidden">{action.shortLabel}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
