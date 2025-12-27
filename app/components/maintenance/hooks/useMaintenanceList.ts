// app/components/maintenance/hooks/useMaintenanceList.ts

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { maintenanceApi } from '@/app/lib/maintenance/maintenanceApi'
import type { MaintenanceListResponse } from '@/app/lib/maintenance/maintenanceApi'
import type {
  ReportFilters,
  ReportFormData,
  ReportStatus,
  ReportPriority,
} from '@/app/lib/maintenance/maintenance'
import { toast } from 'react-hot-toast'

export interface MaintenanceMessages {
  operationError: string
  reportCreated: string
  reportUpdated: string
  statusUpdated: string
  priorityUpdated: string
  reportDeleted: string
  reportRestored: string
}

// Query keys factory
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  list: (filters: ReportFilters & { page?: number; limit?: number }) =>
    [...maintenanceKeys.lists(), filters] as const,
  details: () => [...maintenanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
  stats: () => [...maintenanceKeys.all, 'stats'] as const,
}

interface UseMaintenanceListOptions {
  filters: ReportFilters
  page?: number
  limit?: number
  initialData?: MaintenanceListResponse
  messages: MaintenanceMessages
}

export function useMaintenanceList({
  filters,
  page = 1,
  limit = 20,
  initialData,
  messages,
}: UseMaintenanceListOptions) {
  const queryClient = useQueryClient()

  const queryFilters = { ...filters, page, limit }

  // Main list query
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: maintenanceKeys.list(queryFilters),
    queryFn: () => maintenanceApi.getAll(queryFilters),
    initialData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const reports = data?.reports ?? []
  const pagination = data?.pagination

  // Invalidation helper
  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
  }

  const handleMutationError = (err: unknown) => {
    const message = err instanceof Error ? err.message : messages.operationError
    toast.error(message)
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ReportFormData) => maintenanceApi.create(data),
    onSuccess: () => {
      toast.success(messages.reportCreated)
      invalidateList()
    },
    onError: handleMutationError,
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReportFormData> }) =>
      maintenanceApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success(messages.reportUpdated)
      invalidateList()
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(variables.id) })
    },
    onError: handleMutationError,
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ReportStatus; notes?: string }) =>
      maintenanceApi.updateStatus(id, status, notes),
    onSuccess: (_, variables) => {
      toast.success(messages.statusUpdated)
      invalidateList()
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(variables.id) })
    },
    onError: handleMutationError,
  })

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: ReportPriority }) =>
      maintenanceApi.updatePriority(id, priority),
    onSuccess: (_, variables) => {
      toast.success(messages.priorityUpdated)
      invalidateList()
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(variables.id) })
    },
    onError: handleMutationError,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceApi.delete(id),
    onSuccess: () => {
      toast.success(messages.reportDeleted)
      invalidateList()
    },
    onError: handleMutationError,
  })

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => maintenanceApi.restore(id),
    onSuccess: (_, id) => {
      toast.success(messages.reportRestored)
      invalidateList()
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(id) })
    },
    onError: handleMutationError,
  })

  return {
    // Data
    reports,
    pagination,
    isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,

    // Actions
    refetch,
    createReport: createMutation.mutateAsync,
    updateReport: updateMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    updatePriority: updatePriorityMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
    restoreReport: restoreMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    actionLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      updateStatusMutation.isPending ||
      updatePriorityMutation.isPending ||
      deleteMutation.isPending ||
      restoreMutation.isPending,
  }
}
