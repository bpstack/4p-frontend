// app/dashboard/parking/status/components/modals/OverdueModal.tsx

'use client'

import React from 'react'
import { BiError } from 'react-icons/bi'
import { FiX } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import type { OverdueBooking } from '@/app/lib/parking/types'

interface OverdueModalProps {
  booking: OverdueBooking | null
  isOpen: boolean
  onClose: () => void
  onAction: (action: 'checkout' | 'no-show' | 'cancel' | 'delete') => Promise<void>
  loading: boolean
}

export default function OverdueModal({
  booking,
  isOpen,
  onClose,
  onAction,
  loading,
}: OverdueModalProps) {
  const t = useTranslations('parking.statusModals')

  if (!isOpen || !booking) return null

  const actions = [
    {
      id: 'checkout',
      label: t('checkOutAction'),
      description: t('checkOutDesc'),
      icon: '🚗',
      color: 'amber',
    },
    {
      id: 'no-show',
      label: t('markNoShow'),
      description: t('markNoShowDesc'),
      icon: '❌',
      color: 'yellow',
    },
    {
      id: 'cancel',
      label: t('cancelBookingAction'),
      description: t('cancelBookingDesc'),
      icon: '🚫',
      color: 'rose',
    },
    {
      id: 'delete',
      label: t('deleteBooking'),
      description: t('deleteBookingDesc'),
      icon: '🗑️',
      color: 'red',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-orange-200/50 dark:border-orange-800/30 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BiError className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('manageOverdue')}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/10 dark:to-amber-950/10 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{t('client')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {booking.vehicle?.owner || t('noData')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{t('vehicle')}:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                {booking.vehicle?.plate || t('noPlate')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{t('spot')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {booking.spot.level} · {booking.spot.number}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-orange-200 dark:border-orange-800/50">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{t('delay')}:</span>
              <span className="px-3 py-1 font-bold text-orange-900 dark:text-orange-100 bg-orange-200 dark:bg-orange-900/50 rounded-lg">
                {booking.horas_retraso}h
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id as 'checkout' | 'no-show' | 'cancel' | 'delete')}
              disabled={loading}
              className="w-full p-4 text-left border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 disabled:opacity-50 group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
