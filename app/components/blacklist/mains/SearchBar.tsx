// app/dashboard/blacklist/components/mains/SearchBar.tsx
'use client'

/**
 * Barra de búsqueda y filtros para Blacklist
 * - Búsqueda con debounce (400ms)
 * - Filtros: severidad, estado, fechas, usuario
 * - Search params en URL (SSR-friendly)
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useDebounce } from 'use-debounce'
import { IoSearch, IoClose, IoFunnel } from 'react-icons/io5'

interface SearchBarProps {
  totalResults?: number
}

export function SearchBar({ totalResults }: SearchBarProps) {
  const t = useTranslations('blacklist')
  const router = useRouter()
  const searchParams = useSearchParams()

  // ========================================
  // ESTADOS LOCALES
  // ========================================
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)

  // Filtros
  const [documentFilter, setDocumentFilter] = useState(searchParams.get('document') || '')
  const [severityFilter, setSeverityFilter] = useState(searchParams.get('severity') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ACTIVE')
  const [fromDateFilter, setFromDateFilter] = useState(searchParams.get('from_date') || '')
  const [toDateFilter, setToDateFilter] = useState(searchParams.get('to_date') || '')

  // Debounce del término de búsqueda (400ms)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400)

  // ========================================
  // APLICAR BÚSQUEDA (con debounce)
  // ========================================
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm])

  // ========================================
  // APLICAR FILTROS A LA URL
  // ========================================
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()

    // Búsqueda general
    if (debouncedSearchTerm.trim()) {
      params.set('q', debouncedSearchTerm.trim())
    }

    // Filtro por documento
    if (documentFilter.trim()) {
      params.set('document', documentFilter.trim())
    }

    // Filtro por severidad
    if (severityFilter) {
      params.set('severity', severityFilter)
    }

    // Filtro por estado
    if (statusFilter) {
      params.set('status', statusFilter)
    }

    // Filtro por rango de fechas
    if (fromDateFilter) {
      params.set('from_date', fromDateFilter)
    }
    if (toDateFilter) {
      params.set('to_date', toDateFilter)
    }

    // Resetear página al cambiar filtros
    params.set('page', '1')

    router.push(`?${params.toString()}`)
  }, [
    debouncedSearchTerm,
    documentFilter,
    severityFilter,
    statusFilter,
    fromDateFilter,
    toDateFilter,
    router,
  ])

  // ========================================
  // LIMPIAR FILTROS
  // ========================================
  const clearFilters = () => {
    setSearchTerm('')
    setDocumentFilter('')
    setSeverityFilter('')
    setStatusFilter('ACTIVE')
    setFromDateFilter('')
    setToDateFilter('')
    router.push('/dashboard/blacklist')
  }

  // ========================================
  // VERIFICAR SI HAY FILTROS ACTIVOS
  // ========================================
  const hasActiveFilters =
    searchTerm ||
    documentFilter ||
    severityFilter ||
    statusFilter !== 'ACTIVE' ||
    fromDateFilter ||
    toDateFilter

  // ========================================
  // CONTAR FILTROS APLICADOS
  // ========================================
  const getActiveFiltersCount = () => {
    let count = 0
    if (documentFilter) count++
    if (severityFilter) count++
    if (statusFilter && statusFilter !== 'ACTIVE') count++
    if (fromDateFilter || toDateFilter) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Barra principal de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input de búsqueda */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <IoClose size={20} />
            </button>
          )}
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            px-4 py-2.5 rounded-md font-medium text-sm transition-colors relative
            ${
              showFilters
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 dark:bg-[#161B22] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1c2128] border border-gray-300 dark:border-gray-700'
            }
          `}
        >
          <span className="flex items-center gap-2">
            <IoFunnel size={16} />
            {t('filters.filters')}
          </span>
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {/* Botón limpiar (solo si hay filtros activos) */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-md font-medium text-sm transition-colors bg-gray-100 dark:bg-[#161B22] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1c2128] border border-gray-300 dark:border-gray-700 flex items-center gap-2"
          >
            <IoClose size={16} />
            {t('filters.clear')}
          </button>
        )}
      </div>

      {/* Resultados */}
      {totalResults !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalResults === 0 ? (
            <span>{t('filters.noResults')}</span>
          ) : (
            <span>
              {totalResults === 1
                ? t('filters.resultsSingle', { count: totalResults })
                : t('filters.resultsPlural', { count: totalResults })}
            </span>
          )}
        </div>
      )}

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro: Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('filters.document')}
              </label>
              <input
                type="text"
                placeholder={t('filters.documentPlaceholder')}
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            {/* Filtro: Severidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('filters.severity')}
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              >
                <option value="">{t('filters.all')}</option>
                <option value="LOW">{t('severity.low')}</option>
                <option value="MEDIUM">{t('severity.medium')}</option>
                <option value="HIGH">{t('severity.high')}</option>
                <option value="CRITICAL">{t('severity.critical')}</option>
              </select>
            </div>

            {/* Filtro: Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('filters.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              >
                <option value="ACTIVE">{t('filters.active')}</option>
                <option value="DELETED">{t('filters.deleted')}</option>
                <option value="ALL">{t('filters.allStatuses')}</option>
              </select>
            </div>

            {/* Filtro: Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('filters.dateFrom')}
              </label>
              <input
                type="date"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            {/* Filtro: Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('filters.dateTo')}
              </label>
              <input
                type="date"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0D1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Botón aplicar filtros */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t('filters.applyFilters')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
// ```

// ---

// ## ✅ Features del SearchBar:

// 1. ✅ **Búsqueda con debounce (400ms)** - Evita llamadas excesivas
// 2. ✅ **Filtros avanzados**:
//    - Documento (DNI, Pasaporte)
//    - Gravedad (LOW, MEDIUM, HIGH, CRITICAL)
//    - Estado (ACTIVO, ELIMINADO, TODOS)
//    - Rango de fechas (desde/hasta)
// 3. ✅ **Search params en URL** - SSR-friendly, URLs compartibles
// 4. ✅ **Badge de filtros activos** - Contador visual
// 5. ✅ **Clear filters** - Botón para resetear todo
// 6. ✅ **Contador de resultados** - "234 resultados encontrados"
// 7. ✅ **Panel colapsable** - Filtros se muestran/ocultan
// 8. ✅ **Responsive** - Grid adaptable (1/2/4 columnas)
// 9. ✅ **Dark mode completo**
// 10. ✅ **Reset de página** - Al filtrar vuelve a página 1

// ---

// ### 📊 Ejemplo de URLs generadas:
// ```
// /dashboard/blacklist?q=john
// /dashboard/blacklist?q=john&severity=HIGH&page=1
// /dashboard/blacklist?document=12345678A&status=ACTIVE
// /dashboard/blacklist?from_date=2024-01-01&to_date=2024-12-31
// /dashboard/blacklist?q=john&severity=HIGH&status=ACTIVE&page=2
