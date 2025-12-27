// app/components/parking/helpers/constants.ts
/**
 * Constantes compartidas para el módulo de parking
 */

export type BookingStatus = 'reserved' | 'checked_in' | 'completed' | 'canceled' | 'no_show'

export const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  reserved: {
    label: 'Reservado',
    color:
      'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  },
  checked_in: {
    label: 'Ocupado',
    color:
      'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  },
  completed: {
    label: 'Completado',
    color:
      'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  canceled: {
    label: 'Cancelado',
    color:
      'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
  },
  no_show: {
    label: 'No presentado',
    color:
      'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  },
}

export const BOOKING_SOURCES: Record<string, string> = {
  direct: 'Directo',
  booking_com: 'Booking.com',
  expedia: 'Expedia',
  airbnb: 'Airbnb',
  agency_other: 'Otra Agencia',
}

export const PAYMENT_METHODS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  agency: 'Agencia',
}

export const SPOT_TYPES: Record<string, string> = {
  normal: 'Normal',
  ancha: 'Ancha',
  mas_ancha: 'Muy Ancha',
  esquina: 'Esquina',
  accesible: 'Accesible',
  estrecha_bicis: 'Bicis/Motos',
}
