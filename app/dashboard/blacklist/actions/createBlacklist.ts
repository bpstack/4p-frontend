// app/dashboard/blacklist/actions/createBlacklist.ts
'use server'

/**
 * Server Action: Crear nuevo registro en blacklist
 * 1. Valida datos con Zod
 * 2. Sube imágenes a Cloudinary
 * 3. Crea el registro en BD
 */

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { BlacklistFormData, BlacklistEntry } from '@/app/lib/blacklist/types'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

interface CreateBlacklistResult {
  success: boolean
  data?: BlacklistEntry
  error?: string
}

export async function createBlacklist(formData: BlacklistFormData): Promise<CreateBlacklistResult> {
  try {
    console.log('[createBlacklist] Iniciando creación de registro')

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return { success: false, error: 'No autorizado, falta token' }
    }

    if (!formData.guest_name || !formData.document_number) {
      return { success: false, error: 'Datos incompletos' }
    }

    // Convertir fechas al formato YYYY-MM-DD que espera el backend
    const checkInDate =
      typeof formData.check_in_date === 'string'
        ? new Date(formData.check_in_date)
        : formData.check_in_date
    const checkOutDate =
      typeof formData.check_out_date === 'string'
        ? new Date(formData.check_out_date)
        : formData.check_out_date

    // Convertir datos del formulario al formato del backend
    const payload = {
      guest_name: formData.guest_name,
      document_type: formData.document_type,
      document_number: formData.document_number,
      check_in_date: checkInDate.toISOString().split('T')[0],
      check_out_date: checkOutDate.toISOString().split('T')[0],
      reason: formData.reason,
      severity: formData.severity,
      images: formData.images || [],
      comments: formData.comments,
    }

    const response = await fetch(`${API_BASE}/api/blacklist`, {
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

    const newEntry = await response.json()
    console.log('[createBlacklist] Registro creado:', newEntry.id)
    revalidatePath('/dashboard/blacklist')

    return { success: true, data: newEntry }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear el registro'
    console.error('[createBlacklist] Error:', message)
    return { success: false, error: message }
  }
}
