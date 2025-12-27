// app/components/search/useGlobalSearch.ts
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'

// Types
export interface ParkingResult {
  id: number
  booking_code: string
  plate_number: string | null
  owner_name: string | null
  status: string
}

export interface MaintenanceResult {
  id: string
  title: string
  room_number: string | null
  status: string
  priority: string
}

export interface GroupResult {
  id: number
  name: string
  agency: string | null
  status: string
}

export interface BlacklistResult {
  id: number
  guest_name: string
  document_number: string
  severity: string
}

export interface SearchResults {
  parking: ParkingResult[]
  maintenance: MaintenanceResult[]
  groups: GroupResult[]
  blacklist: BlacklistResult[]
}

interface SearchResponse {
  success: boolean
  query: string
  totalResults: number
  results: SearchResults
}

// Helper functions
export const isParkingCode = (q: string) => q.toLowerCase().startsWith('pk-')
export const getMinChars = (q: string) => (isParkingCode(q) ? 11 : 4)

export function useGlobalSearch() {
  const t = useTranslations('common')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = useCallback(async () => {
    const minChars = getMinChars(query.trim())
    if (query.trim().length < minChars) {
      setError(isParkingCode(query.trim()) ? t('search.minCharsParking') : t('search.minChars'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<SearchResponse>(
        `${API_BASE_URL}/api/search?q=${encodeURIComponent(query.trim())}`
      )

      if (response.success) {
        setResults(response.results)
      } else {
        setError(t('search.error'))
      }
    } catch (err) {
      console.error('[GlobalSearch] Error:', err)
      setError(t('search.error'))
    } finally {
      setIsLoading(false)
    }
  }, [query, t])

  const handleSearch = useCallback(() => {
    const minChars = getMinChars(query.trim())
    if (query.trim().length >= minChars) {
      performSearch()
    }
  }, [query, performSearch])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults(null)
    setError(null)
  }, [])

  const navigateTo = useCallback(
    (path: string) => {
      clearSearch()
      router.push(path)
    },
    [clearSearch, router]
  )

  const totalResults = results
    ? results.parking.length +
      results.maintenance.length +
      results.groups.length +
      results.blacklist.length
    : 0

  return {
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
  }
}
