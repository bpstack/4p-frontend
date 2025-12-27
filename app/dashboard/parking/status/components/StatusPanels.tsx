//app/dashboard/parking/status/components/StatusPanels.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FiCheckCircle, FiLogOut, FiAlertCircle } from 'react-icons/fi'
import { MdLocalParking } from 'react-icons/md'
import type {
  AvailabilityData,
  ParkingSpotDisplay,
  OverdueBooking,
  ParkingBooking,
} from '@/app/lib/parking/types'

interface StatusPanelsProps {
  availabilityData: AvailabilityData | null
  spots: ParkingSpotDisplay[]
  overdueBookings: OverdueBooking[]
  onCheckIn: (booking: ParkingBooking) => void
  onCheckOut: (booking: ParkingBooking) => void
  onOverdueClick: (booking: OverdueBooking) => void
  layout?: 'horizontal' | 'vertical'
}

export default function StatusPanels({
  availabilityData,
  spots = [],
  overdueBookings = [],
  onCheckIn,
  onCheckOut,
  onOverdueClick,
  layout = 'vertical',
}: StatusPanelsProps) {
  const t = useTranslations('parking')
  const reservedSpots = spots.filter((s) => s.status === 'reserved')

  const checkoutTodaySpots = spots.filter((s) => {
    if (s.status !== 'checked_in' || !s.booking?.schedule?.expected_checkout) return false
    const checkoutDate = new Date(s.booking.schedule.expected_checkout)
    const today = new Date()
    checkoutDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    return checkoutDate.getTime() === today.getTime()
  })

  // Layout horizontal: solo mostrar tarjetas de resumen compactas
  if (layout === 'horizontal') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Plazas */}
        <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MdLocalParking className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('statusPanels.total')}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {availabilityData?.summary.total_spots || 0}
          </p>
        </div>

        {/* Disponibles */}
        <div className="bg-white dark:bg-[#0d1117] border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiCheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('statusPanels.available')}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {availabilityData?.summary.available_spots || 0}
          </p>
        </div>

        {/* Check-ins Pendientes */}
        <div className="bg-white dark:bg-[#0d1117] border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiCheckCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('statusPanels.pending')}
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {reservedSpots.length}
          </p>
        </div>

        {/* Retrasadas */}
        <div className="bg-white dark:bg-[#0d1117] border border-orange-200 dark:border-orange-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiAlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('statusPanels.overdue')}
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {overdueBookings.length}
          </p>
        </div>
      </div>
    )
  }

  // Layout vertical: paneles completos con listas
  return (
    <div className="space-y-6">
      {/* Resumen General */}
      {availabilityData && (
        <div className="bg-[#f6f8fa] dark:bg-[#0d1117] border-2 border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <MdLocalParking className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {t('statusPanels.generalSummary')}
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {t('statusPanels.totalSpots')}:
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                {availabilityData.summary.total_spots}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {t('statusPanels.available')}:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                {availabilityData.summary.available_spots}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {t('statusPanels.reserved')}:
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-lg">
                {availabilityData.summary.reserved_spots}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {t('statusPanels.occupied')}:
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-lg">
                {availabilityData.summary.occupied_spots}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-indigo-100 dark:border-indigo-900/30">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {t('statusPanels.occupancy')}:
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">
                {Math.round(availabilityData.summary.occupancy_rate)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Check-ins Pendientes */}
      <div className="bg-[#f6f8fa] dark:bg-[#0d1117] border-2 border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-b-2 border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t('statusPanels.pendingCheckIns')}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            {reservedSpots.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {reservedSpots.map((spot) => (
            <div
              key={spot.id}
              className="p-4 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {spot.booking?.vehicle?.owner || t('statusPanels.noClient')}
                </p>
                <button
                  onClick={() => spot.booking && onCheckIn(spot.booking)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all duration-200 shadow-sm"
                  disabled={!spot.booking}
                >
                  {t('statusPanels.entry')}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {t('statusPanels.spot')} {spot.spot_number} • {spot.spot_type.replace('_', ' ')}
              </p>
              {spot.booking?.vehicle && (
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                  {spot.booking.vehicle.model} • {spot.booking.vehicle.plate}
                </p>
              )}
            </div>
          ))}
          {reservedSpots.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {t('statusPanels.noPendingCheckIns')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Check-outs Pendientes */}
      <div className="bg-[#f6f8fa] dark:bg-[#0d1117] border-2 border-amber-200/50 dark:border-amber-800/30 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b-2 border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FiLogOut className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t('statusPanels.pendingCheckOuts')}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            {checkoutTodaySpots.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {checkoutTodaySpots.map((spot) => {
            const checkout = spot.booking?.schedule?.expected_checkout
            const isToday = checkout
              ? (() => {
                  const checkoutDate = new Date(checkout)
                  const today = new Date()
                  checkoutDate.setHours(0, 0, 0, 0)
                  today.setHours(0, 0, 0, 0)
                  return checkoutDate.getTime() === today.getTime()
                })()
              : false

            return (
              <div
                key={spot.id}
                className="p-4 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {spot.booking?.vehicle?.owner || t('statusPanels.noClient')}
                  </p>
                  <button
                    onClick={() => spot.booking && onCheckOut(spot.booking)}
                    className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-200 shadow-sm ${
                      isToday
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                    }`}
                    disabled={!spot.booking}
                  >
                    {t('statusPanels.exit')}
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {t('statusPanels.spot')} {spot.spot_number} • {spot.spot_type.replace('_', ' ')}
                </p>
                {spot.booking?.vehicle && (
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                    {spot.booking.vehicle.model} • {spot.booking.vehicle.plate}
                  </p>
                )}
              </div>
            )
          })}
          {checkoutTodaySpots.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {t('statusPanels.noPendingCheckOuts')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reservas Retrasadas */}
      <div className="bg-white dark:bg-slate-900 border-2 border-orange-200/50 dark:border-orange-800/30 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b-2 border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FiAlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t('statusPanels.overdueBookings')}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            {overdueBookings.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {overdueBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 hover:bg-orange-50/40 dark:hover:bg-orange-950/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {booking.vehicle?.owner || t('statusPanels.noClient')}
                </p>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">
                    {t('statusPanels.delayHours', { hours: booking.horas_retraso })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {booking.spot.level} · {booking.spot.number}
              </p>
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                  {booking.vehicle
                    ? `${booking.vehicle.plate} • ${booking.vehicle.model}`
                    : t('statusPanels.noClient')}
                </p>
                <button
                  onClick={() => onOverdueClick(booking)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg transition-all duration-200 shadow-sm"
                >
                  {t('statusPanels.manage')}
                </button>
              </div>
            </div>
          ))}
          {overdueBookings.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {t('statusPanels.noOverdueBookings')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
