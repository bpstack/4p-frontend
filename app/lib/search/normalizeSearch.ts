/**
 * Utilidad para normalizar texto para búsqueda
 * Convierte a minúsculas y remueve acentos
 */

export function normalizeForSearch(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .trim()
}

export function highlightSearchResult(
  text: string,
  searchTerm: string
): { highlighted: string; searchLength: number } {
  if (!searchTerm || !text) return { highlighted: text, searchLength: 0 }

  const normalizedText = normalizeForSearch(text)
  const normalizedSearch = normalizeForSearch(searchTerm)

  if (!normalizedText.includes(normalizedSearch)) {
    return { highlighted: text, searchLength: 0 }
  }

  const _index = normalizedText.indexOf(normalizedSearch)
  const length = searchTerm.length

  return {
    highlighted: text,
    searchLength: length,
  }
}
