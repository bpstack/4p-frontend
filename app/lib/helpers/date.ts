// lib/helpers/date.ts

/**
 * Date utilities for frontend (visualization only)
 *
 * ⚠️ IMPORTANT: These functions are ONLY for displaying dates to users.
 * All date calculations should be done in the backend.
 *
 * Timezone: Europe/Madrid (CET/CEST)
 * Display format: DD-MM-YYYY (Spanish format)
 */

/**
 * Get current date in Madrid timezone
 * Format: YYYY-MM-DD (for API communication)
 *
 * @example
 * getMadridDate() // "2025-10-28"
 */
export const getMadridDate = (): string => {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

/**
 * Format a date for display in Madrid timezone
 * Format: DD/MM/YYYY (Spanish format)
 *
 * @example
 * const date = new Date('2025-10-28')
 * formatMadridDate(date) // "28/10/2025"
 * formatMadridDate(date, { weekday: 'long' }) // "Tuesday, 28/10/2025"
 */
export const formatMadridDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return dateObj.toLocaleDateString('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  })
}

/**
 * Format a date for display with full month name
 *
 * @example
 * formatMadridDateLong(new Date('2025-10-28'))
 * // "Tuesday, 28 de octubre de 2025"
 */
export const formatMadridDateLong = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return dateObj.toLocaleDateString('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Calculate date offset from today (in Madrid timezone)
 * Returns in YYYY-MM-DD format for API calls
 *
 * @example
 * getDateWithOffset(0)   // Today
 * getDateWithOffset(-7)  // 7 days ago
 * getDateWithOffset(7)   // 7 days from now
 */
export const getDateWithOffset = (days: number): string => {
  const today = new Date(getMadridDate() + 'T12:00:00')
  today.setDate(today.getDate() + days)
  return today.toISOString().split('T')[0]
}

/**
 * Get start and end of current week (Monday-Sunday)
 * Week starts on Monday
 * Returns in YYYY-MM-DD format for API calls
 */
export const getCurrentWeekRange = () => {
  const today = new Date(getMadridDate() + 'T12:00:00')
  const dayOfWeek = today.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - daysFromMonday)

  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  }
}

/**
 * Get start and end of current month
 * Returns in YYYY-MM-DD format for API calls
 */
export const getCurrentMonthRange = () => {
  const madridNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }))

  const year = madridNow.getFullYear()
  const month = madridNow.getMonth()

  // Last day of month (day 0 of next month = last day of current month)
  const lastDay = new Date(year, month + 1, 0)

  return {
    start: `${year}-${String(month + 1).padStart(2, '0')}-01`,
    end: `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`,
  }
}

/**
 * Format date range for display
 * Format: DD/MM - DD/MM/YYYY (Spanish format)
 *
 * @example
 * formatDateRange('2025-10-01', '2025-10-07')
 * // "01/10 - 07/10/2025"
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')

  const startFormatted = start.toLocaleDateString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
  })

  const endFormatted = end.toLocaleDateString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return `${startFormatted} - ${endFormatted}`
}

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY for display
 *
 * @example
 * formatApiDate('2025-10-28') // "28/10/2025"
 */
export const formatApiDate = (apiDate: string): string => {
  const [year, month, day] = apiDate.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD for API calls
 *
 * @example
 * parseDisplayDate('28/10/2025') // "2025-10-28"
 */
export const parseDisplayDate = (displayDate: string): string => {
  const [day, month, year] = displayDate.split('/')
  return `${year}-${month}-${day}`
}

// ============================================
// NUEVAS FUNCIONES PARA LOGBOOKS (AÑADIR AL FINAL)
// ============================================

/**
 * Format a timestamp with date and time in Madrid timezone
 * Format: DD/MM/YYYY HH:MM (Spanish format)
 *
 * @example
 * formatMadridDateTime('2025-10-28T15:30:00') // "28/10/2025 15:30"
 * formatMadridDateTime(new Date()) // "28/10/2025 15:30"
 */
export const formatMadridDateTime = (
  dateTime: Date | string,
  options?: { includeSeconds?: boolean }
): string => {
  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime

  return dateObj.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(options?.includeSeconds && { second: '2-digit' }),
  })
}

/**
 * Format a timestamp for edit indicators in logbooks
 *
 * @example
 * formatEditTimestamp('2025-10-28T15:30:00') // "28/10/2025 15:30"
 */
export const formatEditTimestamp = (dateTime: Date | string): string => {
  return formatMadridDateTime(dateTime)
}

/**
 * Format time only in Madrid timezone
 * Format: HH:MM (24h format)
 *
 * @example
 * formatMadridTime('2025-10-28T15:30:00') // "15:30"
 */
export const formatMadridTime = (
  dateTime: Date | string,
  options?: { includeSeconds?: boolean }
): string => {
  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime

  return dateObj.toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    ...(options?.includeSeconds && { second: '2-digit' }),
  })
}

/**
 * Check if two dates are the same day in Madrid timezone
 *
 * @example
 * isSameDay(new Date(), new Date()) // true
 * isSameDay('2025-10-28', '2025-10-29') // false
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(d1) === formatter.format(d2)
}

/**
 * Get relative time string (e.g., "hace 5 minutos", "hace 2 horas")
 *
 * @example
 * getRelativeTime(new Date(Date.now() - 60000)) // "hace 1 minuto"
 * getRelativeTime(new Date(Date.now() - 3600000)) // "hace 1 hora"
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'ahora mismo'
  if (diffMins === 1) return 'hace 1 minuto'
  if (diffMins < 60) return `hace ${diffMins} minutos`
  if (diffHours === 1) return 'hace 1 hora'
  if (diffHours < 24) return `hace ${diffHours} horas`
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`

  // Para más de una semana, mostrar fecha
  return formatMadridDate(dateObj)
}

// ============================================
// FUNCIONES ADICIONALES PARA COMPATIBILIDAD CON SIMPLECALENDAR
// ============================================

/**
 * Formatea Date a DD/MM/YYYY (formato español local)
 * Alias de formatMadridDate pero con formato DD/MM/YYYY explícito
 */
export function formatDateLocal(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Formatea Date a YYYY-MM-DD (para inputs type="date" y URLs)
 */
export function formatDateForInput(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convierte string YYYY-MM-DD a Date
 */
export function parseInputDate(dateString: string): Date {
  return new Date(dateString + 'T12:00:00') // Mediodía para evitar problemas de timezone
}

// ============================================
// FUNCIONES PARA PANELES (SlidePanel, CenterModal)
// ============================================

/**
 * Format date for display in panels with short month
 * Format: DD MMM YYYY (e.g., "28 oct 2025")
 *
 * Accepts both Date objects and YYYY-MM-DD strings.
 * Returns empty string for undefined/null/empty values.
 *
 * @example
 * formatDateDisplayShort('2025-10-28') // "28 oct 2025"
 * formatDateDisplayShort(new Date()) // "18 dic 2025"
 * formatDateDisplayShort(undefined) // ""
 */
export function formatDateDisplayShort(date: Date | string | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseInputDate(date) : date

  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
