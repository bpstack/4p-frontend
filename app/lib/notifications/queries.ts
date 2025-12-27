// lib/notifications/queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type { Notification } from './types'

const API_URL = API_BASE_URL

// ═══════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

// ═══════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════

interface NotificationsResponse {
  data?: Notification[]
}

interface UnreadCountResponse {
  count?: number
}

// ═══════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════

/**
 * Fetch all notifications
 */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<NotificationsResponse>(`${API_URL}/api/notifications`)
      return response.data || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Fetch unread notifications only
 */
export function useUnreadNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: async () => {
      const response = await apiClient.get<NotificationsResponse>(
        `${API_URL}/api/notifications/unread`
      )
      return response.data || []
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  })
}

/**
 * Fetch unread count (lightweight query for bell badge)
 */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await apiClient.get<UnreadCountResponse>(
        `${API_URL}/api/notifications/unread/count`
      )
      return response.count || 0
    },
    staleTime: 1000 * 30, // 30 seconds - refresh more often
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  })
}

// ═══════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════

/**
 * Mark single notification as read
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.patch<unknown>(`${API_URL}/api/notifications/${id}/read`)
      return id
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.list()
      )
      const previousCount = queryClient.getQueryData<number>(notificationKeys.unreadCount())

      // Optimistically update notifications list
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.list(),
          previousNotifications.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        )
      }

      // Optimistically update count
      if (typeof previousCount === 'number') {
        queryClient.setQueryData<number>(
          notificationKeys.unreadCount(),
          Math.max(0, previousCount - 1)
        )
      }

      return { previousNotifications, previousCount }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(notificationKeys.list(), context.previousNotifications)
      }
      if (typeof context?.previousCount === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousCount)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch<unknown>(`${API_URL}/api/notifications/read-all`)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.list()
      )

      // Optimistically mark all as read
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.list(),
          previousNotifications.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
          }))
        )
      }

      // Set count to 0
      queryClient.setQueryData<number>(notificationKeys.unreadCount(), 0)

      return { previousNotifications }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(notificationKeys.list(), context.previousNotifications)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Delete notification (admin only)
 */
export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete<unknown>(`${API_URL}/api/notifications/${id}`)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.list()
      )
      const previousCount = queryClient.getQueryData<number>(notificationKeys.unreadCount())

      // Optimistically remove
      if (previousNotifications) {
        const deleted = previousNotifications.find((n) => n.id === id)
        queryClient.setQueryData<Notification[]>(
          notificationKeys.list(),
          previousNotifications.filter((n) => n.id !== id)
        )

        // Update count if deleted was unread
        if (deleted && !deleted.is_read && typeof previousCount === 'number') {
          queryClient.setQueryData<number>(
            notificationKeys.unreadCount(),
            Math.max(0, previousCount - 1)
          )
        }
      }

      return { previousNotifications, previousCount }
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(notificationKeys.list(), context.previousNotifications)
      }
      if (typeof context?.previousCount === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousCount)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
