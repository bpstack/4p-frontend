// app/components/search/GlobalSearch.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { FiSearch, FiLoader, FiTruck, FiTool, FiUsers, FiAlertCircle, FiX } from 'react-icons/fi'
import { useGlobalSearch, getMinChars } from './useGlobalSearch'

export function GlobalSearch() {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    totalResults,
    handleSearch,
    clearSearch,
    navigateTo,
    t,
  } = useGlobalSearch()

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Open dropdown when results arrive
  useEffect(() => {
    if (results) {
      setIsOpen(true)
    }
  }, [results])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    clearSearch()
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    navigateTo(path)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="w-48 lg:w-64 pl-9 pr-16 py-1.5 text-sm bg-gray-100 dark:bg-[#010409] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
        />
        {/* Clear button (X) */}
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t('actions.close')}
          >
            <FiX className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading || query.trim().length < getMinChars(query.trim())}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('search.searchButton')}
        >
          {isLoading ? (
            <FiLoader className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <FiSearch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 lg:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('search.resultsFor', { query })} · {totalResults} {t('search.results')}
            </p>
          </div>

          {error && <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          {totalResults === 0 && !error && (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('search.noResults')}
            </div>
          )}

          {/* Parking Results */}
          {results && results.parking.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiTruck className="h-3 w-3" />
                  {t('search.categories.parking')}
                </h3>
              </div>
              {results.parking.map((item) => (
                <button
                  key={`parking-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/parking/bookings/${item.booking_code}`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.booking_code}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.plate_number || t('search.noPlate')} ·{' '}
                    {item.owner_name || t('search.noOwner')}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Maintenance Results */}
          {results && results.maintenance.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiTool className="h-3 w-3" />
                  {t('search.categories.maintenance')}
                </h3>
              </div>
              {results.maintenance.map((item) => (
                <button
                  key={`maintenance-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/maintenance/${item.id}`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.room_number ? `${t('search.room')} ${item.room_number}` : item.id} ·{' '}
                    <span
                      className={
                        item.priority === 'urgent'
                          ? 'text-red-500'
                          : item.priority === 'high'
                            ? 'text-orange-500'
                            : ''
                      }
                    >
                      {item.priority}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Groups Results */}
          {results && results.groups.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiUsers className="h-3 w-3" />
                  {t('search.categories.groups')}
                </h3>
              </div>
              {results.groups.map((item) => (
                <button
                  key={`group-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/groups/${item.id}`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.agency || t('search.noAgency')} · {item.status}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Blacklist Results */}
          {results && results.blacklist.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiAlertCircle className="h-3 w-3" />
                  {t('search.categories.blacklist')}
                </h3>
              </div>
              {results.blacklist.map((item) => (
                <button
                  key={`blacklist-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/blacklist/${item.id}`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.guest_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.document_number} ·{' '}
                    <span
                      className={
                        item.severity === 'CRITICAL'
                          ? 'text-red-500'
                          : item.severity === 'HIGH'
                            ? 'text-orange-500'
                            : ''
                      }
                    >
                      {item.severity}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('search.hint')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
