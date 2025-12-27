// app/components/parking/bookings/BookingHeader.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { ParkingBooking } from '@/app/lib/parking/types'
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiLogIn,
  FiLogOut,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi'
import { StatusBadge } from '../StatusBadge'
import { type BookingStatus } from '../helpers'

interface BookingHeaderProps {
  booking: ParkingBooking
  onEdit: () => void
  onDelete: () => void
  onCheckIn: () => void
  onCheckOut: () => void
  onCancel: () => void
  onNoShow: () => void
}

export function BookingHeader({
  booking,
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
  onCancel,
  onNoShow,
}: BookingHeaderProps) {
  const router = useRouter()
  const t = useTranslations('parking')

  const canCheckIn = booking.status === 'reserved'
  const canCheckOut = booking.status === 'checked_in'
  const canEdit = ['reserved', 'checked_in'].includes(booking.status)
  const canCancel = ['reserved', 'checked_in'].includes(booking.status)
  const canNoShow = booking.status === 'reserved'
  const canDelete = ['reserved', 'canceled'].includes(booking.status)

  return (
    <div className="border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#010409]">
      <div className="max-w-[1400px] px-4 md:px-6 py-4">
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard/parking/bookings')}
          className="inline-flex items-center gap-1.5 text-xs text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#f0f6fc] mb-4 transition-colors"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          {t('header.backToList')}
        </button>

        {/* Header content */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#24292f] dark:text-[#f0f6fc]">
              {booking.booking_code}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <StatusBadge status={booking.status as BookingStatus} />
              {booking.vehicle && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#ddf4ff] dark:bg-[#388bfd26] text-[#0969da] dark:text-[#58a6ff] border border-[#54aeff66] dark:border-[#388bfd66]">
                  {booking.vehicle.plate}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {canCheckIn && (
              <button
                onClick={onCheckIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1a7f37] hover:bg-[#116329] border border-[#1a7f37] hover:border-[#116329] rounded-md transition-colors"
              >
                <FiLogIn className="w-3.5 h-3.5" />
                {t('bookingDetail.checkIn')}
              </button>
            )}

            {canCheckOut && (
              <button
                onClick={onCheckOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0969da] hover:bg-[#0860CA] border border-[#0969da] hover:border-[#0860CA] rounded-md transition-colors"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                {t('bookingDetail.checkOut')}
              </button>
            )}

            {canEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] hover:border-[#1b1f2426] dark:hover:border-[#8b949e] transition-colors"
              >
                <FiEdit className="w-3.5 h-3.5" />
                {t('bookingDetail.actions.edit')}
              </button>
            )}

            {canCancel && (
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#cf222e] dark:text-[#f85149] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#ffebe9] dark:hover:bg-[#490202] hover:border-[#cf222e] dark:hover:border-[#f85149] transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
                {t('bookingDetail.actions.cancel')}
              </button>
            )}

            {canNoShow && (
              <button
                onClick={onNoShow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9a6700] dark:text-[#d29922] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#fff8c5] dark:hover:bg-[#3d2c00] hover:border-[#9a6700] dark:hover:border-[#d29922] transition-colors"
                title={t('bookingDetail.actions.noShow')}
              >
                <FiAlertTriangle className="w-3.5 h-3.5" />
                {t('bookingDetail.actions.noShow')}
              </button>
            )}

            {canDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#cf222e] dark:text-[#f85149] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#ffebe9] dark:hover:bg-[#490202] hover:border-[#cf222e] dark:hover:border-[#f85149] transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                {t('bookingDetail.actions.delete')}
              </button>
            )}
          </div>
        </div>

        {/* Payment warning */}
        {booking.payment.pending_amount > 0 && booking.status === 'checked_in' && (
          <div className="mt-4 p-3 bg-[#fff8c5] dark:bg-[#3d2c00] border border-[#d4a72c66] dark:border-[#d29922] rounded-md">
            <p className="text-xs font-medium text-[#9a6700] dark:text-[#d29922]">
              {t('header.pendingPayment', { amount: booking.payment.pending_amount.toFixed(2) })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHeader
