// app/dashboard/maintenance/actions/createMaintenance.ts
'use server'

import { cookies } from 'next/headers'
import type { ReportFormData, ReportWithDetails } from '@/app/lib/maintenance/maintenance'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export interface CreateMaintenanceResponse {
  success: boolean
  data: ReportWithDetails
  message?: string
}

export async function createMaintenance(data: ReportFormData): Promise<CreateMaintenanceResponse> {
  try {
    console.log('[createMaintenance] Creando reporte:', data.title)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear reporte'
    console.error('[createMaintenance] Error:', message)
    throw new Error(message)
  }
}
