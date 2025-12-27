// app/lib/blacklist/blacklistUtils.ts
/**
 * Utilidades para el módulo Blacklist
 * Funciones helper para búsqueda, normalización, highlight, etc.
 */

// ========================================
// NORMALIZAR TEXTO (sin acentos)
// ========================================
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .trim()
}

// ========================================
// HIGHLIGHT DE COINCIDENCIAS
// ========================================
export function highlightMatches(text: string, searchTerm: string): string {
  if (!searchTerm) return text

  const normalizedText = normalizeText(text)
  const normalizedSearch = normalizeText(searchTerm)

  // Buscar coincidencias sin importar acentos
  const regex = new RegExp(`(${escapeRegex(normalizedSearch)})`, 'gi')

  // Encontrar posiciones de coincidencias
  let result = text
  const matches = normalizedText.matchAll(regex)

  for (const match of matches) {
    if (match.index !== undefined) {
      const start = match.index
      const end = start + searchTerm.length
      const originalText = text.substring(start, end)
      result = result.replace(
        originalText,
        `<mark class="bg-yellow-200 dark:bg-yellow-800">${originalText}</mark>`
      )
    }
  }

  return result
}

// ========================================
// ESCAPAR CARACTERES ESPECIALES REGEX
// ========================================
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ========================================
// FORMATEAR FECHA
// ========================================
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// ========================================
// FORMATEAR FECHA Y HORA
// ========================================
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// ========================================
// VALIDAR RANGO DE FECHAS
// ========================================
export function isValidDateRange(from: Date | string, to: Date | string): boolean {
  const fromDate = typeof from === 'string' ? new Date(from) : from
  const toDate = typeof to === 'string' ? new Date(to) : to
  return toDate > fromDate
}

// ========================================
// CALCULAR DÍAS DE HOSPEDAJE
// ========================================
export function calculateStayDays(checkIn: string, checkOut: string): number {
  const from = new Date(checkIn)
  const to = new Date(checkOut)
  const diffTime = Math.abs(to.getTime() - from.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// ========================================
// GENERAR NOMBRE DE ARCHIVO PARA EXPORT
// ========================================
export function generateExportFilename(): string {
  const now = new Date()
  const timestamp = now.toISOString().split('T')[0].replace(/-/g, '')
  return `blacklist_export_${timestamp}.xlsx`
}

// ========================================
// SANITIZAR DOCUMENTO (uppercase, sin espacios)
// ========================================
export function sanitizeDocument(doc: string): string {
  return doc.toUpperCase().replace(/\s+/g, '').trim()
}

// ========================================
// VALIDAR FORMATO DNI/NIE ESPAÑOL
// ========================================
export function isValidSpanishDocument(type: string, number: string): boolean {
  if (type === 'DNI') {
    const dniRegex = /^[0-9]{8}[A-Z]$/
    return dniRegex.test(number)
  }

  if (type === 'NIE') {
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    return nieRegex.test(number)
  }

  return true // Para otros tipos, no validamos formato específico
}

// ========================================
// OBTENER COLOR DE SEVERIDAD
// ========================================
export function getSeverityColor(severity: string): string {
  const colors = {
    LOW: 'text-blue-600 dark:text-blue-400',
    MEDIUM: 'text-yellow-600 dark:text-yellow-400',
    HIGH: 'text-orange-600 dark:text-orange-400',
    CRITICAL: 'text-red-600 dark:text-red-400',
  }
  return colors[severity as keyof typeof colors] || colors.LOW
}

// ========================================
// OBTENER ICONO DE SEVERIDAD
// ========================================
export function getSeverityIcon(severity: string): string {
  const icons = {
    LOW: '🔵',
    MEDIUM: '🟡',
    HIGH: '🟠',
    CRITICAL: '🔴',
  }
  return icons[severity as keyof typeof icons] || icons.LOW
}

// ========================================
// TRUNCAR TEXTO
// ========================================
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// ========================================
// DEBOUNCE (para búsqueda)
// ========================================
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ========================================
// OBTENER INICIALES DE USUARIO
// ========================================
export function getUserInitials(username: string): string {
  const parts = username.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return username.substring(0, 2).toUpperCase()
}
