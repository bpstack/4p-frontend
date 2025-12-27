// lib/notifications/useNotifications.ts
// Wrapper hook that combines React Query with a simple interface

import { useCallback } from 'react'
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from './queries'

export function useNotifications() {
  // Queries
  const {
    data: notifications = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchNotifications,
  } = useNotificationsQuery()

  const { data: unreadCount = 0, refetch: fetchUnreadCount } = useUnreadCountQuery()

  // Mutations
  const markAsReadMutation = useMarkAsReadMutation()
  const markAllAsReadMutation = useMarkAllAsReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()

  // Wrap mutations in callbacks for consistent API
  const markAsRead = useCallback(
    async (id: number) => {
      await markAsReadMutation.mutateAsync(id)
    },
    [markAsReadMutation]
  )

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync()
  }, [markAllAsReadMutation])

  const deleteNotification = useCallback(
    async (id: number) => {
      await deleteNotificationMutation.mutateAsync(id)
    },
    [deleteNotificationMutation]
  )

  // Error handling
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Error al cargar notificaciones'
    : null

  return {
    // Data
    notifications,
    unreadCount,
    loading,
    error,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Mutation states (for UI feedback)
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  }
}
