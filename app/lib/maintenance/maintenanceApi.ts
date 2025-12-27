// app/lib/maintenance/maintenanceApi.ts
/**
 * Servicio API para el módulo Maintenance
 * Todas las llamadas HTTP al backend centralizadas aquí
 * Para uso en Client Components
 */

import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  MaintenanceReport,
  ReportWithDetails,
  ReportFilters,
  ReportFormData,
  ReportStatus,
  ReportPriority,
  MaintenanceImage,
} from './maintenance'

const API_BASE = API_BASE_URL

// ========================================
// TIPOS DE RESPUESTA
// ========================================

export interface MaintenanceListResponse {
  reports: MaintenanceReport[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters_applied?: Record<string, unknown>
}

export interface MaintenanceDetailResponse {
  report: ReportWithDetails
}

export interface MaintenanceStatsResponse {
  success: boolean
  data: {
    total: number
    by_status: Record<string, number>
    by_priority: Record<string, number>
    by_location: Record<string, number>
    rooms_out_of_service: number
  }
}

// ========================================
// API CLIENT
// ========================================

export const maintenanceApi = {
  // ========================================
  // OBTENER REPORTES (con paginación y filtros)
  // ========================================
  getAll: async (
    filters?: ReportFilters & { page?: number; limit?: number }
  ): Promise<MaintenanceListResponse> => {
    const params = new URLSearchParams()

    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.location_type) params.append('location_type', filters.location_type)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `${API_BASE}/api/maintenance?${params.toString()}`
    return apiClient.get(url)
  },

  // ========================================
  // OBTENER REPORTE POR ID (con imágenes e historial)
  // ========================================
  getById: async (id: string): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance/${id}`
    return apiClient.get(url)
  },

  // ========================================
  // CREAR REPORTE
  // ========================================
  create: async (data: ReportFormData): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance`

    const payload = {
      title: data.title,
      description: data.description,
      location_type: data.location_type,
      location_description: data.location_description,
      room_number: data.room_number || null,
      room_out_of_service: data.room_out_of_service || false,
      priority: data.priority || 'medium',
      assigned_to: data.assigned_to || null,
      assigned_type: data.assigned_type || null,
      external_company_name: data.external_company_name || null,
      external_contact: data.external_contact || null,
    }

    return apiClient.post(url, payload)
  },

  // ========================================
  // ACTUALIZAR REPORTE
  // ========================================
  update: async (id: string, data: Partial<ReportFormData>): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance/${id}`
    return apiClient.patch(url, data)
  },

  // ========================================
  // ACTUALIZAR ESTADO
  // ========================================
  updateStatus: async (
    id: string,
    status: ReportStatus,
    notes?: string
  ): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance/${id}/status`
    return apiClient.patch(url, { status, notes })
  },

  // ========================================
  // ACTUALIZAR PRIORIDAD
  // ========================================
  updatePriority: async (
    id: string,
    priority: ReportPriority
  ): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance/${id}/priority`
    return apiClient.patch(url, { priority })
  },

  // ========================================
  // AGREGAR NOTAS DE RESOLUCIÓN
  // ========================================
  addResolutionNotes: async (id: string, notes: string): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance/${id}/resolution-notes`
    return apiClient.patch(url, { notes })
  },

  // ========================================
  // ELIMINAR REPORTE (soft delete)
  // ========================================
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const url = `${API_BASE}/api/maintenance/${id}`
    return apiClient.delete(url)
  },

  // ========================================
  // RESTAURAR REPORTE
  // ========================================
  restore: async (id: string): Promise<MaintenanceDetailResponse> => {
    const url = `${API_BASE}/api/maintenance/${id}/restore`
    return apiClient.patch(url, {})
  },

  // ========================================
  // ELIMINAR IMAGEN
  // ========================================
  deleteImage: async (
    reportId: string,
    imageId: number
  ): Promise<{ success: boolean; message: string }> => {
    const url = `${API_BASE}/api/maintenance/${reportId}/images/${imageId}`
    return apiClient.delete(url)
  },

  // ========================================
  // OBTENER ESTADÍSTICAS
  // ========================================
  getStats: async (): Promise<MaintenanceStatsResponse> => {
    const url = `${API_BASE}/api/maintenance/stats`
    return apiClient.get(url)
  },

  // ========================================
  // SUBIR IMAGEN A UN REPORTE (via Cloudinary)
  // ========================================
  uploadImage: async (
    reportId: string,
    file: File
  ): Promise<{ message: string; image: MaintenanceImage }> => {
    const url = `${API_BASE}/api/maintenance/${reportId}/images`

    const formData = new FormData()
    formData.append('image', file)

    return apiClient.postFormData(url, formData)
  },

  // ========================================
  // SUBIR MÚLTIPLES IMÁGENES A UN REPORTE
  // ========================================
  uploadImages: async (
    reportId: string,
    files: File[]
  ): Promise<Array<{ message: string; image: MaintenanceImage }>> => {
    const uploadPromises = files.map((file) => maintenanceApi.uploadImage(reportId, file))
    return Promise.all(uploadPromises)
  },
}
