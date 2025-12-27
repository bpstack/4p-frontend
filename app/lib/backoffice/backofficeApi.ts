// app/lib/backoffice/backofficeApi.ts
/**
 * Servicio API para el módulo Back Office
 * Todas las llamadas HTTP al backend centralizadas aquí
 */

import { apiClient } from '@/app/lib/apiClient'
import type {
  Category,
  SupplierWithStats,
  SupplierFormData,
  SupplierFilters,
  InvoiceWithDetails,
  InvoiceFormData,
  InvoiceFilters,
  InvoiceHistory,
  Asset,
  AssetType,
  SummaryStats,
  CategoriesResponse,
  SuppliersResponse,
  SupplierDetailResponse,
  InvoicesResponse,
  InvoiceDetailResponse,
  AssetsResponse,
  MonthlySummaryResponse,
} from './types'

import { API_BASE_URL } from '@/app/lib/env'

const API_BASE = API_BASE_URL

// ========================================
// API CLIENT
// ========================================

export const backofficeApi = {
  // ========================================
  // CATEGORÍAS
  // ========================================

  /**
   * Obtener todas las categorías activas
   */
  getCategories: async (): Promise<CategoriesResponse> => {
    const url = `${API_BASE}/api/backoffice/categories`
    return apiClient.get(url)
  },

  /**
   * Obtener categoría por ID
   */
  getCategoryById: async (id: number): Promise<{ category: Category }> => {
    const url = `${API_BASE}/api/backoffice/categories/${id}`
    return apiClient.get(url)
  },

  /**
   * Crear nueva categoría
   */
  createCategory: async (data: {
    cost_center: string
    department: string
    description?: string
  }): Promise<{ message: string; category: Category }> => {
    const url = `${API_BASE}/api/backoffice/categories`
    return apiClient.post(url, data)
  },

  // ========================================
  // PROVEEDORES
  // ========================================

  /**
   * Obtener todos los proveedores con filtros y paginación
   */
  getSuppliers: async (filters?: SupplierFilters): Promise<SuppliersResponse> => {
    const params = new URLSearchParams()

    if (filters?.category_id) params.append('category_id', filters.category_id.toString())
    if (filters?.periodicity) params.append('periodicity', filters.periodicity)
    if (filters?.payment_method) params.append('payment_method', filters.payment_method)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `${API_BASE}/api/backoffice/suppliers?${params.toString()}`
    return apiClient.get(url)
  },

  /**
   * Obtener proveedor por ID con estadísticas y facturas
   */
  getSupplierById: async (id: number): Promise<SupplierDetailResponse> => {
    const url = `${API_BASE}/api/backoffice/suppliers/${id}`
    return apiClient.get(url)
  },

  /**
   * Crear nuevo proveedor
   */
  createSupplier: async (
    data: SupplierFormData
  ): Promise<{ message: string; supplier: SupplierWithStats }> => {
    const url = `${API_BASE}/api/backoffice/suppliers`
    return apiClient.post(url, data)
  },

  /**
   * Actualizar proveedor
   */
  updateSupplier: async (
    id: number,
    data: Partial<SupplierFormData>
  ): Promise<{ message: string; supplier: SupplierWithStats }> => {
    const url = `${API_BASE}/api/backoffice/suppliers/${id}`
    return apiClient.patch(url, data)
  },

  /**
   * Desactivar proveedor (soft delete)
   */
  deleteSupplier: async (id: number): Promise<{ message: string }> => {
    const url = `${API_BASE}/api/backoffice/suppliers/${id}`
    return apiClient.delete(url)
  },

  // ========================================
  // FACTURAS
  // ========================================

  /**
   * Obtener todas las facturas con filtros y paginación
   */
  getInvoices: async (filters?: InvoiceFilters): Promise<InvoicesResponse> => {
    const params = new URLSearchParams()

    if (filters?.status) params.append('status', filters.status)
    if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString())
    if (filters?.category_id) params.append('category_id', filters.category_id.toString())
    if (filters?.payment_method) params.append('payment_method', filters.payment_method)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.include_deleted) params.append('include_deleted', 'true')
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `${API_BASE}/api/backoffice/invoices?${params.toString()}`
    return apiClient.get(url)
  },

  /**
   * Obtener factura por ID con historial
   */
  getInvoiceById: async (id: number): Promise<InvoiceDetailResponse> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}`
    return apiClient.get(url)
  },

  /**
   * Obtener historial de una factura
   */
  getInvoiceHistory: async (id: number): Promise<{ history: InvoiceHistory[] }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/history`
    return apiClient.get(url)
  },

  /**
   * Crear nueva factura
   */
  createInvoice: async (
    data: InvoiceFormData
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices`
    return apiClient.post(url, data)
  },

  /**
   * Actualizar factura
   */
  updateInvoice: async (
    id: number,
    data: Partial<InvoiceFormData>
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}`
    return apiClient.patch(url, data)
  },

  /**
   * Validar factura (aprobar con sello/firma)
   */
  validateInvoice: async (
    id: number,
    data?: {
      validated_pdf_url?: string
      validated_pdf_public_id?: string
      validation_notes?: string
    }
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/validate`
    return apiClient.post(url, data || {})
  },

  /**
   * Rechazar factura
   */
  rejectInvoice: async (
    id: number,
    notes: string
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/reject`
    return apiClient.post(url, { notes })
  },

  /**
   * Revertir validación (validated -> pending)
   */
  unvalidateInvoice: async (
    id: number,
    notes?: string
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/unvalidate`
    return apiClient.post(url, { notes: notes || null })
  },

  /**
   * Marcar factura como pagada
   */
  markAsPaid: async (
    id: number,
    paid_date: string
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/pay`
    return apiClient.post(url, { paid_date })
  },

  /**
   * Eliminar factura (soft delete)
   */
  /**
   * Eliminar factura (hard delete - eliminación permanente)
   */
  deleteInvoice: async (id: number): Promise<{ message: string }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}`
    return apiClient.delete(url)
  },

  /**
   * Subir PDF de factura
   */
  uploadInvoicePdf: async (
    id: number,
    file: File,
    type: 'original' | 'validated'
  ): Promise<{ message: string; invoice: InvoiceWithDetails }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/pdf?type=${type}`

    const formData = new FormData()
    formData.append('pdf', file)

    return apiClient.postFormData(url, formData)
  },

  /**
   * Obtener URL firmada para visualizar PDF
   */
  getInvoicePdfUrl: async (
    id: number,
    type: 'original' | 'validated'
  ): Promise<{ url: string; expires_in: number }> => {
    const url = `${API_BASE}/api/backoffice/invoices/${id}/pdf-url?type=${type}`
    return apiClient.get(url)
  },

  /**
   * Obtener URL para descargar PDF (proxy del backend)
   */
  getInvoicePdfDownloadUrl: (id: number, type: 'original' | 'validated'): string => {
    return `${API_BASE}/api/backoffice/invoices/${id}/pdf-download?type=${type}`
  },

  /**
   * Obtener PDF como Blob (para vista previa embebida)
   */
  getBlob: async (url: string): Promise<Blob> => {
    return apiClient.getBlob(url)
  },

  /**
   * Descargar múltiples facturas validadas como ZIP
   * @param invoiceIds - Array de IDs de facturas (max 100)
   * @returns Blob del archivo ZIP
   * @throws Error si alguna factura no está validada o no tiene PDF validado
   */
  downloadValidatedInvoicesZip: async (invoiceIds: number[]): Promise<Blob> => {
    const url = `${API_BASE}/api/backoffice/invoices/download-zip`

    const makeRequest = async (): Promise<Response> =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_ids: invoiceIds }),
        credentials: 'include',
      })

    let response = await makeRequest()

    if (typeof window !== 'undefined' && response.status === 401) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        })

        if (!refreshResponse.ok) {
          throw new Error(`Refresh failed: ${refreshResponse.status}`)
        }

        await refreshResponse.json().catch(() => null)

        response = await makeRequest()
      } catch (error) {
        if (typeof window !== 'undefined') {
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        }

        throw error
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(errorData.error || `Error ${response.status}`)
    }

    return response.blob()
  },

  // ========================================
  // ASSETS (SELLOS Y FIRMAS)
  // ========================================

  /**
   * Obtener todos los assets
   */
  getAssets: async (type?: AssetType): Promise<AssetsResponse> => {
    const params = type ? `?type=${type}` : ''
    const url = `${API_BASE}/api/backoffice/assets${params}`
    return apiClient.get(url)
  },

  /**
   * Crear nuevo asset (sello o firma)
   */
  createAsset: async (data: {
    type: AssetType
    name: string
    image: File
    is_default?: boolean
  }): Promise<{ message: string; asset: Asset }> => {
    const url = `${API_BASE}/api/backoffice/assets`

    const formData = new FormData()
    formData.append('type', data.type)
    formData.append('name', data.name)
    formData.append('image', data.image)
    if (data.is_default !== undefined) {
      formData.append('is_default', data.is_default.toString())
    }

    return apiClient.postFormData(url, formData)
  },

  /**
   * Eliminar asset
   */
  deleteAsset: async (id: number): Promise<{ message: string }> => {
    const url = `${API_BASE}/api/backoffice/assets/${id}`
    return apiClient.delete(url)
  },

  /**
   * Establecer asset como predeterminado
   */
  setDefaultAsset: async (id: number): Promise<{ message: string; asset: Asset }> => {
    const url = `${API_BASE}/api/backoffice/assets/${id}/default`
    return apiClient.patch(url, {})
  },

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Obtener estadísticas generales
   */
  getStats: async (): Promise<SummaryStats> => {
    const url = `${API_BASE}/api/backoffice/stats`
    return apiClient.get(url)
  },

  /**
   * Obtener resumen mensual
   */
  getMonthlySummary: async (year?: number): Promise<MonthlySummaryResponse> => {
    const params = year ? `?year=${year}` : ''
    const url = `${API_BASE}/api/backoffice/stats/monthly${params}`
    return apiClient.get(url)
  },

  // ========================================
  // BATCH PAYMENT
  // ========================================

  /**
   * Preview batch payment - muestra cuántas facturas se marcarían como pagadas
   * @param year - Año objetivo (opcional, default: mes anterior)
   * @param month - Mes objetivo 1-12 (opcional, default: mes anterior)
   */
  previewBatchPayment: async (
    year?: number,
    month?: number
  ): Promise<{
    message: string
    year: number
    month: number
    count: number
    total_amount: number
  }> => {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (month) params.append('month', month.toString())

    const queryString = params.toString()
    const url = `${API_BASE}/api/backoffice/invoices/batch-pay/preview${queryString ? `?${queryString}` : ''}`
    return apiClient.get(url)
  },

  /**
   * Ejecutar batch payment - marca todas las facturas validated del mes como paid
   * @param year - Año objetivo (opcional, default: mes anterior)
   * @param month - Mes objetivo 1-12 (opcional, default: mes anterior)
   */
  executeBatchPayment: async (
    year?: number,
    month?: number
  ): Promise<{
    message: string
    success: boolean
    count: number
    invoiceIds: number[]
    year: number
    month: number
    duration: number
  }> => {
    const url = `${API_BASE}/api/backoffice/invoices/batch-pay`
    return apiClient.post(url, { year, month })
  },

  /**
   * Preview revert batch payment - muestra cuántas facturas se revertirían a validated
   * @param year - Año objetivo (requerido)
   * @param month - Mes objetivo 1-12 (requerido)
   */
  previewRevertBatchPayment: async (
    year: number,
    month: number
  ): Promise<{
    message: string
    year: number
    month: number
    count: number
    total_amount: number
  }> => {
    const url = `${API_BASE}/api/backoffice/invoices/batch-pay/revert/preview?year=${year}&month=${month}`
    return apiClient.get(url)
  },

  /**
   * Revertir batch payment - revierte todas las facturas paid del mes a validated
   * @param year - Año objetivo (requerido)
   * @param month - Mes objetivo 1-12 (requerido)
   */
  revertBatchPayment: async (
    year: number,
    month: number
  ): Promise<{
    message: string
    success: boolean
    count: number
    invoiceIds: number[]
    year: number
    month: number
    duration: number
  }> => {
    const url = `${API_BASE}/api/backoffice/invoices/batch-pay/revert`
    return apiClient.post(url, { year, month })
  },
}

export default backofficeApi
