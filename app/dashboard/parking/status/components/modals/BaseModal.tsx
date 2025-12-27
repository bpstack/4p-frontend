// app/dashboard/parking/status/components/modals/BaseModal.tsx

'use client'

import React from 'react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  footer: React.ReactNode
  colorScheme: 'emerald' | 'amber' | 'rose' | 'orange'
  loading?: boolean
}

const colorClasses = {
  emerald: {
    border: 'border-emerald-200/50 dark:border-emerald-800/30',
    header: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
    headerBorder: 'border-emerald-100 dark:border-emerald-900/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    border: 'border-amber-200/50 dark:border-amber-800/30',
    header: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    headerBorder: 'border-amber-100 dark:border-amber-900/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    border: 'border-rose-200/50 dark:border-rose-800/30',
    header: 'from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20',
    headerBorder: 'border-rose-100 dark:border-rose-900/30',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  orange: {
    border: 'border-orange-200/50 dark:border-orange-800/30',
    header: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
    headerBorder: 'border-orange-100 dark:border-orange-900/30',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
}

export default function BaseModal({
  isOpen,
  onClose: _onClose,
  title,
  icon,
  children,
  footer,
  colorScheme,
  loading: _loading = false,
}: BaseModalProps) {
  if (!isOpen) return null

  const colors = colorClasses[colorScheme]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md bg-[#f6f8fa] dark:bg-[#0d1117] rounded-2xl shadow-2xl border ${colors.border} overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 bg-gradient-to-r ${colors.header} border-b ${colors.headerBorder} flex items-center gap-3`}
        >
          <div className={`p-2 ${colors.iconBg} rounded-lg`}>
            <div className={colors.iconColor}>{icon}</div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">{children}</div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          {footer}
        </div>
      </div>
    </div>
  )
}
