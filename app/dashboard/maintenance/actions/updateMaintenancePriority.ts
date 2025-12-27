// app/dashboard/maintenance/actions/updateMaintenancePriority.ts
'use server'

import { cookies } from 'next/headers'
import type { ReportPriority, ReportWithDetails } from '@/app/lib/maintenance/maintenance'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export interface UpdatePriorityResponse {
  success: boolean
  data: ReportWithDetails
  message?: string
}

export async function updateMaintenancePriority(
  id: string,
  priority: ReportPriority
): Promise<UpdatePriorityResponse> {
  try {
    console.log('[updateMaintenancePriority] Actualizando prioridad:', id, priority)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    const url = `${API_BASE}/api/maintenance/${id}/priority`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priority }),
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
    const message = error instanceof Error ? error.message : 'Error al actualizar prioridad'
    console.error('[updateMaintenancePriority] Error:', message)
    throw new Error(message)
  }
}
