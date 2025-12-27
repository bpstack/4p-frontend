// lib/messaging/hooks/useUserSearch.ts

import { useState, useCallback, useEffect } from 'react'
import { searchUsers } from '../queries'
import type { UserSearchResult } from '../types'

interface UseUserSearchOptions {
  enabled?: boolean
  debounceMs?: number
}

export function useUserSearch(options: UseUserSearchOptions = {}) {
  const { enabled = true, debounceMs = 300 } = options

  // State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected users for group creation
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([])

  // Search users
  const search = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchUsers(searchQuery)
      setResults(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al buscar usuarios'
      setError(message)
      console.error('Error searching users:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle user selection
  const toggleUser = useCallback((user: UserSearchResult) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id)
      if (exists) {
        return prev.filter((u) => u.id !== user.id)
      }
      return [...prev, user]
    })
  }, [])

  // Check if user is selected
  const isSelected = useCallback(
    (userId: string) => {
      return selectedUsers.some((u) => u.id === userId)
    },
    [selectedUsers]
  )

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedUsers([])
  }, [])

  // Reset all state
  const reset = useCallback(() => {
    setQuery('')
    setResults([])
    setSelectedUsers([])
    setError(null)
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (!enabled) return

    const timer = setTimeout(() => {
      search(query || undefined)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, enabled, debounceMs, search])

  return {
    // State
    query,
    setQuery,
    results,
    loading,
    error,
    selectedUsers,

    // Computed
    isGroup: selectedUsers.length > 1,
    canCreate: selectedUsers.length > 0,

    // Actions
    search,
    toggleUser,
    isSelected,
    clearSelection,
    reset,
  }
}
