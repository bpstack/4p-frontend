// app/dashboard/maintenance/actions/getMaintenanceById.ts
'use server'

import { cookies } from 'next/headers'
import type { ReportWithDetails } from '@/app/lib/maintenance/maintenance'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export interface MaintenanceDetailResponse {
  success: boolean
  data: ReportWithDetails
}

export async function getMaintenanceById(id: string): Promise<MaintenanceDetailResponse> {
  try {
    console.log('[getMaintenanceById] Obteniendo reporte:', id)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    const url = `${API_BASE}/api/maintenance/${id}`

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
      if (response.status === 404) {
        throw new Error('Reporte no encontrado')
      }
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener reporte'
    console.error('[getMaintenanceById] Error:', message)
    throw new Error(message)
  }
}
