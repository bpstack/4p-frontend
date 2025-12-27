// app/components/parking/StatusBadge.tsx
'use client'

import { useTranslations } from 'next-intl'
import { STATUS_CONFIG, type BookingStatus } from './helpers'

interface StatusBadgeProps {
  status: BookingStatus | string
  size?: 'sm' | 'md'
}

// Mapeo de status a claves de traducción
const STATUS_TRANSLATION_KEYS: Record<BookingStatus, string> = {
  reserved: 'status.reserved',
  checked_in: 'status.checkedIn',
  completed: 'status.completed',
  canceled: 'status.canceled',
  no_show: 'status.noShow',
}

/**
 * Badge de estado para reservas de parking
 * Componente compartido para usar en toda la aplicación
 */
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const t = useTranslations('parking')
  const config = STATUS_CONFIG[status as BookingStatus] || STATUS_CONFIG.reserved
  const translationKey = STATUS_TRANSLATION_KEYS[status as BookingStatus] || 'status.reserved'

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium flex-shrink-0 ${config.color} ${sizeClasses}`}
    >
      {t(translationKey)}
    </span>
  )
}

export default StatusBadge
