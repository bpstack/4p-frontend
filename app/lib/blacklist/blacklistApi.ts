// app/lib/blacklist/blacklistApi.ts
/**
 * Servicio API para el módulo Blacklist
 * Todas las llamadas HTTP al backend centralizadas aquí
 */

import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  BlacklistEntry,
  BlacklistResponse,
  BlacklistDetailResponse,
  BlacklistFilters,
  BlacklistFormData,
  ImageUploadResponse,
} from './types'

const API_BASE = API_BASE_URL

export const blacklistApi = {
  // ========================================
  // OBTENER REGISTROS (con paginación y filtros)
  // ========================================
  getAll: async (filters?: BlacklistFilters): Promise<BlacklistResponse> => {
    const params = new URLSearchParams()

    if (filters?.q) params.append('q', filters.q)
    if (filters?.document) params.append('document', filters.document)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.created_by) params.append('created_by', filters.created_by)
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `${API_BASE}/api/blacklist?${params.toString()}`
    return apiClient.get(url)
  },

  // ========================================
  // OBTENER REGISTRO POR ID (con audit trail)
  // ========================================
  getById: async (id: string): Promise<BlacklistDetailResponse> => {
    const url = `${API_BASE}/api/blacklist/${id}`
    return apiClient.get(url)
  },

  // ========================================
  // CREAR REGISTRO
  // ========================================
  create: async (data: BlacklistFormData): Promise<BlacklistEntry> => {
    const url = `${API_BASE}/api/blacklist`

    // Convertir datos del formulario al formato del backend
    const payload = {
      guest_name: data.guest_name,
      document_type: data.document_type,
      document_number: data.document_number,
      check_in_date:
        typeof data.check_in_date === 'string'
          ? data.check_in_date
          : data.check_in_date.toISOString(),
      check_out_date:
        typeof data.check_out_date === 'string'
          ? data.check_out_date
          : data.check_out_date.toISOString(),
      reason: data.reason,
      severity: data.severity,
      images: data.images, // Ya serán URLs después de subir a Cloudinary
      comments: data.comments,
    }

    return apiClient.post(url, payload)
  },

  // ========================================
  // ACTUALIZAR REGISTRO
  // ========================================
  update: async (id: string, data: Partial<BlacklistFormData>): Promise<BlacklistEntry> => {
    const url = `${API_BASE}/api/blacklist/${id}`

    // Convertir fechas si están presentes
    const payload: Record<string, unknown> = { ...data }
    if (payload.check_in_date && typeof payload.check_in_date !== 'string') {
      payload.check_in_date = (payload.check_in_date as Date).toISOString()
    }
    if (payload.check_out_date && typeof payload.check_out_date !== 'string') {
      payload.check_out_date = (payload.check_out_date as Date).toISOString()
    }

    return apiClient.patch(url, payload)
  },

  // ========================================
  // ELIMINAR REGISTRO (soft delete)
  // ========================================
  delete: async (id: string): Promise<{ message: string }> => {
    const url = `${API_BASE}/api/blacklist/${id}`
    return apiClient.delete(url)
  },

  // ========================================
  // RESTAURAR REGISTRO
  // ========================================
  restore: async (id: string): Promise<BlacklistEntry> => {
    const url = `${API_BASE}/api/blacklist/${id}/restore`
    return apiClient.patch(url, {})
  },

  // ========================================
  // SUBIR IMAGEN A CLOUDINARY
  // ========================================
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const url = `${API_BASE}/api/blacklist/upload`

    const formData = new FormData()
    formData.append('image', file)

    return apiClient.postFormData(url, formData)
  },

  // ========================================
  // SUBIR MÚLTIPLES IMÁGENES
  // ========================================
  uploadImages: async (files: File[]): Promise<ImageUploadResponse[]> => {
    // Subir en paralelo
    const uploadPromises = files.map((file) => blacklistApi.uploadImage(file))
    return Promise.all(uploadPromises)
  },

  // ========================================
  // ELIMINAR IMAGEN DE CLOUDINARY
  // ========================================
  deleteImage: async (publicId: string): Promise<{ message: string }> => {
    const url = `${API_BASE}/api/blacklist/upload/${publicId}`
    return apiClient.delete(url)
  },

  // ========================================
  // EXPORTAR A EXCEL
  // ========================================
  exportToExcel: async (filters?: BlacklistFilters): Promise<Blob> => {
    const params = new URLSearchParams()

    if (filters?.q) params.append('q', filters.q)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)

    const url = `${API_BASE}/api/blacklist/export?${params.toString()}`

    return apiClient.getBlob(url)
  },

  // ========================================
  // OBTENER ESTADÍSTICAS
  // ========================================
  getStats: async (): Promise<{
    total_entries: number
    active_entries: number
    deleted_entries: number
    by_severity: Record<string, number>
    recent_entries: BlacklistEntry[]
  }> => {
    const url = `${API_BASE}/api/blacklist/stats`
    return apiClient.get(url)
  },
}
