// app/components/parking/helpers/date-formatters.ts
/**
 * Utilidades de formato de fecha centralizadas para el módulo de parking
 * Evita duplicación de código entre componentes
 */

/**
 * Formatea una fecha para mostrar (día/mes/año hora:minutos)
 */
export const formatDate = (
  date: string | Date,
  includeTime = true,
  includeSeconds = false
): string => {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')

  if (includeTime) {
    if (includeSeconds) {
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    }
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
  return `${day}/${month}/${year}`
}

/**
 * Formatea fecha corta con mes abreviado (ej: "28 oct 2025")
 */
export const formatDateShort = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formatea solo la hora (ej: "14:30")
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formatea para input datetime-local (ej: "2025-10-28T14:30")
 */
export const formatDateTimeLocal = (date: Date): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Compara si dos fechas son el mismo día
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}
