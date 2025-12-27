// app/dashboard/blacklist/actions/deleteBlacklist.ts
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

interface DeleteBlacklistResult {
  success: boolean
  message?: string
  error?: string
}

export async function deleteBlacklist(id: string): Promise<DeleteBlacklistResult> {
  try {
    console.log('[deleteBlacklist] Eliminando registro:', id)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return { success: false, error: 'No autorizado, falta token' }
    }

    if (!id) {
      return { success: false, error: 'ID de registro no proporcionado' }
    }

    const response = await fetch(`${API_BASE}/api/blacklist/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const result = await response.json().catch(() => ({ message: 'Registro eliminado' }))

    console.log('[deleteBlacklist] Registro eliminado:', id)
    revalidatePath('/dashboard/blacklist')
    revalidatePath(`/dashboard/blacklist/${id}`)

    return { success: true, message: result.message || 'Registro eliminado correctamente' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar el registro'
    console.error('[deleteBlacklist] Error:', message)
    return { success: false, error: message }
  }
}
