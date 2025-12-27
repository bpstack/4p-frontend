// app/lib/logbooks/hooks/useLogbooks.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logbooksApi } from '../queries'
import { LogbookEntry, LogEntry, Comment } from '../types'
import { useDepartments } from './useDepartments'
import toast from 'react-hot-toast'

export interface LogbookMessages {
  entryCreated: string
  entryCreateError: string
  entryUpdated: string
  entryUpdateError: string
  entryDeleted: string
  entryDeleteError: string
  statusResolved: string
  statusPending: string
  statusChangedTo: (status: string) => string
  statusChangeError: string
  markedAsRead: string
  unmarkedAsRead: string
  readStatusError: string
  commentAdded: string
  commentAddError: string
  commentUpdated: string
  commentUpdateError: string
  commentDeleted: string
  commentDeleteError: string
}

// ============================================
// QUERY KEYS
// ============================================

export const logbookKeys = {
  all: ['logbooks'] as const,
  lists: () => [...logbookKeys.all, 'list'] as const,
  list: (date: string) => [...logbookKeys.lists(), date] as const,
  detail: (id: number) => [...logbookKeys.all, 'detail', id] as const,
  readers: (id: number) => [...logbookKeys.all, 'readers', id] as const,
  comments: (logbookId: number) => [...logbookKeys.all, 'comments', logbookId] as const,
}

// ============================================
// HELPERS
// ============================================

function mapPriorityFromBackend(importance_level: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (importance_level) {
    case 'urgente':
      return 'critical'
    case 'alta':
      return 'high'
    case 'media':
      return 'medium'
    default:
      return 'low'
  }
}

function mapPriorityToBackend(
  priority: 'low' | 'medium' | 'high' | 'critical'
): 'baja' | 'media' | 'alta' | 'urgente' {
  switch (priority) {
    case 'critical':
      return 'urgente'
    case 'high':
      return 'alta'
    case 'medium':
      return 'media'
    default:
      return 'baja'
  }
}

// ============================================
// MAIN HOOK
// ============================================

interface UseLogbooksOptions {
  date: string // format: YYYY-MM-DD
  enabled?: boolean
  messages: LogbookMessages
}

export function useLogbooks({ date, enabled = true, messages }: UseLogbooksOptions) {
  const queryClient = useQueryClient()
  const { getDepartmentName } = useDepartments()

  // ============================================
  // QUERY: Get logbooks by day with comments
  // ============================================
  const {
    data: entries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: logbookKeys.list(date),
    queryFn: async (): Promise<LogEntry[]> => {
      const data = (await logbooksApi.getLogbooksByDay(date)) as LogbookEntry[]

      if (!Array.isArray(data) || data.length === 0) {
        return []
      }

      // Fetch comments for each entry in parallel
      const entriesWithComments = await Promise.all(
        data.map(async (entry) => {
          let comments: Comment[] = []
          try {
            const res = (await logbooksApi.comments.getComments(entry.id)) as {
              comments: Comment[]
            }
            comments = Array.isArray(res.comments) ? res.comments : []
          } catch {
            // Silently fail for comments
          }

          return {
            id: entry.id,
            timestamp: entry.created_at || new Date().toISOString(),
            description: entry.message,
            department: getDepartmentName(entry.department_id),
            department_id: entry.department_id,
            priority: mapPriorityFromBackend(entry.importance_level),
            readBy: [],
            status: (entry.is_solved === 1 ? 'resolved' : 'pending') as 'pending' | 'resolved',
            comments,
            author_id: entry.author_id || 'unknown',
            author_name: entry.author_name || 'Unknown',
            updated_at: entry.updated_at,
            is_edited: !!(entry.updated_at && entry.updated_at !== entry.created_at),
          } satisfies LogEntry
        })
      )

      return entriesWithComments
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // ============================================
  // QUERY: Get readers for a logbook
  // ============================================
  const useReaders = (logbookId: number) => {
    return useQuery<{ user_id: string; username: string; read_at: string }[]>({
      queryKey: logbookKeys.readers(logbookId),
      queryFn: () =>
        logbooksApi.getReaders(logbookId) as Promise<
          { user_id: string; username: string; read_at: string }[]
        >,
      staleTime: 30 * 1000, // 30 seconds
      enabled: logbookId > 0,
    })
  }

  // ============================================
  // MUTATION: Create logbook
  // ============================================
  const createLogbook = useMutation({
    mutationFn: async (data: {
      author_id: string
      message: string
      importance_level: 'baja' | 'media' | 'alta' | 'urgente'
      department_id: number
      date: string
    }) => {
      return logbooksApi.createLogbook(data)
    },
    onSuccess: (_, variables) => {
      // Invalidate the list for the date of the new entry
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(variables.date) })
      toast.success(messages.entryCreated)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : messages.entryCreateError
      toast.error(message)
    },
  })

  // ============================================
  // MUTATION: Update logbook
  // ============================================
  const updateLogbook = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: {
        message?: string
        importance_level?: 'baja' | 'media' | 'alta' | 'urgente'
        department_id?: number
      }
    }) => {
      return logbooksApi.updateLogbook(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(date) })
      toast.success(messages.entryUpdated)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : messages.entryUpdateError
      toast.error(message)
    },
  })

  // ============================================
  // MUTATION: Delete logbook
  // ============================================
  const deleteLogbook = useMutation({
    mutationFn: async (id: number) => {
      return logbooksApi.deleteLogbook(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(date) })
      toast.success(messages.entryDeleted)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : messages.entryDeleteError
      toast.error(message)
    },
  })

  // ============================================
  // MUTATION: Mark as solved/pending
  // ============================================
  const toggleStatus = useMutation({
    mutationFn: async ({
      id,
      currentStatus,
    }: {
      id: number
      currentStatus: 'pending' | 'resolved'
    }) => {
      if (currentStatus === 'resolved') {
        return logbooksApi.markAsPending(id)
      }
      return logbooksApi.markAsSolved(id)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(date) })
      const newStatus =
        variables.currentStatus === 'resolved' ? messages.statusPending : messages.statusResolved
      toast.success(messages.statusChangedTo(newStatus))
    },
    onError: () => {
      toast.error(messages.statusChangeError)
    },
  })

  // ============================================
  // MUTATION: Mark as read/unread
  // ============================================
  const toggleRead = useMutation({
    mutationFn: async ({ id, isRead }: { id: number; isRead: boolean }) => {
      if (isRead) {
        return logbooksApi.unmarkAsRead(id)
      }
      return logbooksApi.markAsRead(id)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.readers(variables.id) })
      toast.success(variables.isRead ? messages.unmarkedAsRead : messages.markedAsRead)
    },
    onError: () => {
      toast.error(messages.readStatusError)
    },
  })

  // ============================================
  // MUTATION: Create comment
  // ============================================
  const createComment = useMutation({
    mutationFn: async ({
      logbookId,
      data,
    }: {
      logbookId: number
      data: {
        comment: string
        department_id: number
        importance_level: 'baja' | 'media' | 'alta' | 'urgente'
      }
    }) => {
      return logbooksApi.comments.createComment(logbookId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(date) })
      toast.success(messages.commentAdded)
    },
    onError: () => {
      toast.error(messages.commentAddError)
    },
  })

  // ============================================
  // MUTATION: Update comment
  // ============================================
  const updateComment = useMutation({
    mutationFn: async ({
      logbookId,
      commentId,
      data,
    }: {
      logbookId: number
      commentId: number
      data: {
        comment?: string
        importance_level?: 'baja' | 'media' | 'alta' | 'urgente'
        department_id?: number
      }
    }) => {
      return logbooksApi.comments.updateComment(logbookId, commentId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(date) })
      toast.success(messages.commentUpdated)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : messages.commentUpdateError
      toast.error(message)
    },
  })

  // ============================================
  // MUTATION: Delete comment
  // ============================================
  const deleteComment = useMutation({
    mutationFn: async ({ logbookId, commentId }: { logbookId: number; commentId: number }) => {
      return logbooksApi.comments.deleteComment(logbookId, commentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.list(date) })
      toast.success(messages.commentDeleted)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : messages.commentDeleteError
      toast.error(message)
    },
  })

  return {
    // Query state
    entries,
    isLoading,
    error,
    refetch,

    // Readers hook
    useReaders,

    // Mutations
    createLogbook,
    updateLogbook,
    deleteLogbook,
    toggleStatus,
    toggleRead,
    createComment,
    updateComment,
    deleteComment,

    // Helpers
    mapPriorityFromBackend,
    mapPriorityToBackend,
  }
}

export type UseLogbooksReturn = ReturnType<typeof useLogbooks>
