// app/lib/conciliation/queries.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  ConciliationSummary,
  ConciliationDetail,
  ConciliationFormData,
  ConciliationStatus,
  MonthlySummary,
  CreateConciliationDTO,
} from './types'

const API_BASE = API_BASE_URL

// ═══════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════

export const conciliationKeys = {
  all: ['conciliation'] as const,
  lists: () => [...conciliationKeys.all, 'list'] as const,
  detail: (id: number) => [...conciliationKeys.all, 'detail', id] as const,
  byDay: (date: string) => [...conciliationKeys.all, 'day', date] as const,
  monthly: (year: number, month: number) =>
    [...conciliationKeys.all, 'monthly', year, month] as const,
  missingDays: (year: number, month: number) =>
    [...conciliationKeys.all, 'missing', year, month] as const,
}

// ═══════════════════════════════════════════════════════
// QUERIES - DAILY
// ═══════════════════════════════════════════════════════

/**
 * Obtener todas las conciliaciones
 */
export function useConciliations() {
  return useQuery({
    queryKey: conciliationKeys.lists(),
    queryFn: async (): Promise<ConciliationSummary[]> => {
      return apiClient.get(`${API_BASE}/api/conciliations`)
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Obtener conciliación por fecha específica
 */
export function useConciliationByDay(date: string) {
  return useQuery({
    queryKey: conciliationKeys.byDay(date),
    queryFn: async (): Promise<ConciliationDetail | null> => {
      try {
        const response = await apiClient.get<ConciliationDetail>(
          `${API_BASE}/api/conciliations/day/${date}`
        )
        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Si es 404, día no existe aún - no es error
        if (
          errorMessage.includes('404') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('No encontrado')
        ) {
          return null
        }

        throw error
      }
    },
    staleTime: 30 * 1000,
    retry: false,
  })
}

/**
 * Obtener conciliación por ID
 */
export function useConciliationById(id: number) {
  return useQuery({
    queryKey: conciliationKeys.detail(id),
    queryFn: async (): Promise<ConciliationDetail> => {
      return apiClient.get<ConciliationDetail>(`${API_BASE}/api/conciliations/${id}`)
    },
    staleTime: 30 * 1000,
    enabled: id > 0,
  })
}

// ═══════════════════════════════════════════════════════
// QUERIES - MONTHLY
// ═══════════════════════════════════════════════════════

/**
 * Obtener resumen mensual
 */
export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: conciliationKeys.monthly(year, month),
    queryFn: async (): Promise<MonthlySummary> => {
      return apiClient.get<MonthlySummary>(
        `${API_BASE}/api/conciliations/monthly-summary/${year}/${month}`
      )
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Obtener días faltantes del mes
 */
export function useMissingDays(year: number, month: number) {
  return useQuery({
    queryKey: conciliationKeys.missingDays(year, month),
    queryFn: async (): Promise<string[]> => {
      return apiClient.get<string[]>(
        `${API_BASE}/api/conciliations/monthly-summary/${year}/${month}/missing-days`
      )
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════
// MUTATIONS - CREATE/UPDATE
// ═══════════════════════════════════════════════════════

/**
 * Crear nueva conciliación
 */
export function useCreateConciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateConciliationDTO): Promise<ConciliationDetail> => {
      return apiClient.post<ConciliationDetail>(`${API_BASE}/api/conciliations`, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: conciliationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conciliationKeys.byDay(variables.date) })
    },
  })
}

/**
 * Actualizar formulario completo
 */
export function useUpdateConciliationForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number
      formData: ConciliationFormData
    }): Promise<ConciliationDetail> => {
      return apiClient.put<ConciliationDetail>(`${API_BASE}/api/conciliations/${id}/form`, formData)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: conciliationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: conciliationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conciliationKeys.all })
    },
  })
}

/**
 * Actualizar estado
 */
export function useUpdateConciliationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number
      status: ConciliationStatus
    }): Promise<ConciliationSummary> => {
      return apiClient.patch(`${API_BASE}/api/conciliations/${id}/status`, { status })
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: conciliationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: conciliationKeys.lists() })
    },
  })
}

/**
 * Recalcular totales
 */
export function useRecalculateConciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<ConciliationSummary> => {
      return apiClient.post(`${API_BASE}/api/conciliations/${id}/recalculate`)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: conciliationKeys.detail(id) })
    },
  })
}

/**
 * Eliminar conciliación (soft delete)
 */
export function useDeleteConciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`${API_BASE}/api/conciliations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conciliationKeys.lists() })
    },
  })
}

// ═══════════════════════════════════════════════════════
// MUTATIONS - MONTHLY
// ═══════════════════════════════════════════════════════

/**
 * Actualizar estado del resumen mensual
 */
export function useUpdateMonthlySummaryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      year,
      month,
      status,
    }: {
      year: number
      month: number
      status: ConciliationStatus
    }): Promise<{ success: boolean }> => {
      return apiClient.patch(
        `${API_BASE}/api/conciliations/monthly-summary/${year}/${month}/status`,
        { status }
      )
    },
    onSuccess: (_, { year, month }) => {
      queryClient.invalidateQueries({ queryKey: conciliationKeys.monthly(year, month) })
    },
  })
}

// ═══════════════════════════════════════════════════════
// LEGACY API CLIENT (for gradual migration)
// TODO: Migrate components to use React Query hooks above
// ═══════════════════════════════════════════════════════

export const conciliationApi = {
  async getAll(): Promise<ConciliationSummary[]> {
    return apiClient.get(`${API_BASE}/api/conciliations`)
  },

  async getByDay(date: string): Promise<ConciliationDetail | null> {
    return apiClient.get(`${API_BASE}/api/conciliations/day/${date}`)
  },

  async getById(id: number): Promise<ConciliationDetail> {
    return apiClient.get(`${API_BASE}/api/conciliations/${id}`)
  },

  async create(data: CreateConciliationDTO): Promise<ConciliationDetail> {
    return apiClient.post(`${API_BASE}/api/conciliations`, data)
  },

  async updateForm(id: number, formData: ConciliationFormData): Promise<ConciliationDetail> {
    return apiClient.put(`${API_BASE}/api/conciliations/${id}/form`, formData)
  },

  async updateStatus(id: number, status: ConciliationStatus): Promise<ConciliationSummary> {
    return apiClient.patch(`${API_BASE}/api/conciliations/${id}/status`, { status })
  },

  async recalculate(id: number): Promise<ConciliationSummary> {
    return apiClient.post(`${API_BASE}/api/conciliations/${id}/recalculate`)
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_BASE}/api/conciliations/${id}`)
  },

  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    return apiClient.get(`${API_BASE}/api/conciliations/monthly-summary/${year}/${month}`)
  },

  async validateMonthlySummary(
    year: number,
    month: number
  ): Promise<{ can_close: boolean; errors: string[] }> {
    return apiClient.get(
      `${API_BASE}/api/conciliations/monthly-summary/${year}/${month}/validation`
    )
  },

  async getMissingDays(year: number, month: number): Promise<string[]> {
    return apiClient.get(
      `${API_BASE}/api/conciliations/monthly-summary/${year}/${month}/missing-days`
    )
  },

  async updateMonthlySummaryStatus(
    year: number,
    month: number,
    status: ConciliationStatus
  ): Promise<{ success: boolean }> {
    return apiClient.patch(
      `${API_BASE}/api/conciliations/monthly-summary/${year}/${month}/status`,
      {
        status,
      }
    )
  },
}
