// app/dashboard/blacklist/actions/getBlacklistById.ts
'use server'

import { cookies } from 'next/headers'
import type { BlacklistDetailResponse } from '@/app/lib/blacklist/types'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export async function getBlacklistById(id: string): Promise<BlacklistDetailResponse> {
  try {
    console.log('[getBlacklistById] Obteniendo registro:', id)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    const url = `${API_BASE}/api/blacklist/${id}`

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
    const message = error instanceof Error ? error.message : 'Error al obtener el registro'
    console.error('[getBlacklistById] Error:', message)
    throw new Error(message)
  }
}
