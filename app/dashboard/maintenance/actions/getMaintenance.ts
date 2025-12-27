// app/dashboard/maintenance/actions/getMaintenance.ts
'use server'

import { cookies } from 'next/headers'
import type { ReportFilters, MaintenanceReport } from '@/app/lib/maintenance/maintenance'

import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

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

export async function getMaintenance(
  filters?: ReportFilters & { page?: number; limit?: number }
): Promise<MaintenanceListResponse> {
  try {
    console.log('[getMaintenance] Obteniendo reportes con filtros:', filters)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    // Construir query params
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

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener reportes de mantenimiento'
    console.error('[getMaintenance] Error:', message)
    throw new Error(message)
  }
}
