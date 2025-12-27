// app/components/search/MobileSearchModal.tsx
'use client'

import { useEffect, useRef } from 'react'
import { FiSearch, FiLoader, FiTruck, FiTool, FiUsers, FiAlertCircle, FiX } from 'react-icons/fi'
import { useGlobalSearch, getMinChars } from './useGlobalSearch'

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
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

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    clearSearch()
    onClose()
  }

  const handleNavigate = (path: string) => {
    navigateTo(path)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={handleClose}>
      <div
        className="mt-12 mx-4 bg-white dark:bg-[#010409] rounded-xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="w-full pl-10 pr-10 py-2.5 text-base bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {query.length > 0 && (
              <button
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <FiX className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {t('actions.cancel')}
          </button>
        </div>

        {/* Search Button */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleSearch}
            disabled={isLoading || query.trim().length < getMinChars(query.trim())}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="h-5 w-5 animate-spin" />
                <span>{t('actions.loading')}</span>
              </>
            ) : (
              <>
                <FiSearch className="h-5 w-5" />
                <span>{t('search.searchButton')}</span>
              </>
            )}
          </button>
          {query.trim().length > 0 && query.trim().length < getMinChars(query.trim()) && (
            <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              {t('search.minChars')}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {error && <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          {results && totalResults === 0 && !error && (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
              <FiSearch className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('search.noResults')}</p>
            </div>
          )}

          {/* Parking Results */}
          {results && results.parking.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiTruck className="h-3.5 w-3.5" />
                  {t('search.categories.parking')}
                </h3>
              </div>
              {results.parking.map((item) => (
                <button
                  key={`parking-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/parking/bookings/${item.booking_code}`)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {item.booking_code}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiTool className="h-3.5 w-3.5" />
                  {t('search.categories.maintenance')}
                </h3>
              </div>
              {results.maintenance.map((item) => (
                <button
                  key={`maintenance-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/maintenance/${item.id}`)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiUsers className="h-3.5 w-3.5" />
                  {t('search.categories.groups')}
                </h3>
              </div>
              {results.groups.map((item) => (
                <button
                  key={`group-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/groups/${item.id}`)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <p className="text-base font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.agency || t('search.noAgency')} · {item.status}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Blacklist Results */}
          {results && results.blacklist.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <FiAlertCircle className="h-3.5 w-3.5" />
                  {t('search.categories.blacklist')}
                </h3>
              </div>
              {results.blacklist.map((item) => (
                <button
                  key={`blacklist-${item.id}`}
                  onClick={() => handleNavigate(`/dashboard/blacklist/${item.id}`)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {item.guest_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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

          {/* Hint when no search yet */}
          {!results && !error && (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
              <FiSearch className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('search.hint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
