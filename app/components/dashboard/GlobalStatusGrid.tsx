// app/components/dashboard/GlobalStatusGrid.tsx
'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { FiGrid, FiDollarSign, FiBriefcase, FiMessageSquare } from 'react-icons/fi'
import { FaCar } from 'react-icons/fa'
import { IoIosRestaurant } from 'react-icons/io'
import { HiOutlineDocumentCheck } from 'react-icons/hi2'
import { CgDanger } from 'react-icons/cg'
import { IconType } from 'react-icons'

interface StatusItem {
  label: string
  icon: IconType
  href: string
  id: string
  color: string
  bgColor: string
  adminOnly?: boolean
}

interface GlobalStatusGridProps {
  isUserAdmin: boolean
}

export function GlobalStatusGrid({ isUserAdmin }: GlobalStatusGridProps) {
  const t = useTranslations('dashboard.globalStatus')

  const statusItems: StatusItem[] = useMemo(
    () => [
      {
        label: t('parking'),
        icon: FaCar,
        href: '/dashboard/parking',
        id: 'parking-mgmt',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/10',
      },
      {
        label: t('groups'),
        icon: FiGrid,
        href: '/dashboard/groups',
        id: 'group-mgmt',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/10',
      },
      {
        label: t('blacklist'),
        icon: CgDanger,
        href: '/dashboard/blacklist',
        id: 'blacklist',
        color: 'from-red-600 to-red-700',
        bgColor: 'bg-red-50 dark:bg-red-900/10',
      },
      {
        label: t('restaurant'),
        icon: IoIosRestaurant,
        href: '/dashboard/restaurant',
        id: 'restaurant',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/10',
      },
      {
        label: t('conciliation'),
        icon: HiOutlineDocumentCheck,
        href: '/dashboard/conciliation',
        id: 'conciliation',
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/10',
      },
      {
        label: t('cashier'),
        icon: FiDollarSign,
        href: '/dashboard/cashier/hotel',
        id: 'hotel-cashier',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
      },
      {
        label: t('messages'),
        icon: FiMessageSquare,
        href: '/dashboard/profile?panel=messages',
        id: 'messages',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      },
      {
        label: t('backoffice'),
        icon: FiBriefcase,
        href: '/dashboard/bo',
        adminOnly: true,
        id: 'back-office',
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
      },
    ],
    [t]
  )

  return (
    <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <FiGrid className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
        <h2 className="text-lg font-bold text-[#24292f] dark:text-[#f0f6fc]">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statusItems.map((item) => {
          if (item.adminOnly && !isUserAdmin) return null

          return (
            <a
              key={item.id}
              href={item.href}
              className={`group relative overflow-hidden p-5 ${item.bgColor} border border-[#d0d7de] dark:border-[#30363d] rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={`p-3 bg-gradient-to-br ${item.color} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] leading-tight">
                  {item.label}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 dark:to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
