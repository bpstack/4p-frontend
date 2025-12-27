// app/dashboard/blacklist/actions/restoreBlacklist.ts
'use server'

/**
 * Server Action: Restaurar registro eliminado
 * Limpia el campo deleted_at
 */

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { BlacklistEntry } from '@/app/lib/blacklist/types'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

interface RestoreBlacklistResult {
  success: boolean
  data?: BlacklistEntry
  error?: string
}

export async function restoreBlacklist(id: string): Promise<RestoreBlacklistResult> {
  try {
    console.log('[restoreBlacklist] Restaurando registro:', id)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return { success: false, error: 'No autorizado, falta token' }
    }

    if (!id) {
      return {
        success: false,
        error: 'ID de registro no proporcionado',
      }
    }

    const response = await fetch(`${API_BASE}/api/blacklist/${id}/restore`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const restoredEntry = await response.json()

    console.log('[restoreBlacklist] ✅ Registro restaurado:', restoredEntry.id)

    // Revalidar páginas
    revalidatePath('/dashboard/blacklist')
    revalidatePath(`/dashboard/blacklist/${id}`)

    return {
      success: true,
      data: restoredEntry,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al restaurar el registro'
    console.error('[restoreBlacklist] ❌ Error:', message)
    return {
      success: false,
      error: message,
    }
  }
}
