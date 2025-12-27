// app/dashboard/maintenance/actions/deleteMaintenance.ts
'use server'

import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export interface DeleteMaintenanceResponse {
  success: boolean
  message: string
}

export async function deleteMaintenance(id: string): Promise<DeleteMaintenanceResponse> {
  try {
    console.log('[deleteMaintenance] Eliminando reporte:', id)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    const url = `${API_BASE}/api/maintenance/${id}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
    const message = error instanceof Error ? error.message : 'Error al eliminar reporte'
    console.error('[deleteMaintenance] Error:', message)
    throw new Error(message)
  }
}
