// app/dashboard/maintenance/actions/updateMaintenance.ts
'use server'

import { cookies } from 'next/headers'
import type { ReportFormData, ReportWithDetails } from '@/app/lib/maintenance/maintenance'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export interface UpdateMaintenanceResponse {
  success: boolean
  data: ReportWithDetails
  message?: string
}

export async function updateMaintenance(
  id: string,
  data: Partial<ReportFormData>
): Promise<UpdateMaintenanceResponse> {
  try {
    console.log('[updateMaintenance] Actualizando reporte:', id)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    const url = `${API_BASE}/api/maintenance/${id}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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
    const message = error instanceof Error ? error.message : 'Error al actualizar reporte'
    console.error('[updateMaintenance] Error:', message)
    throw new Error(message)
  }
}
