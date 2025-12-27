// app/dashboard/blacklist/actions/getBlacklist.ts
'use server'

import { cookies } from 'next/headers'
import type { BlacklistFilters, BlacklistResponse } from '@/app/lib/blacklist/types'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export async function getBlacklist(filters?: BlacklistFilters): Promise<BlacklistResponse> {
  try {
    console.log('[getBlacklist] Obteniendo registros con filtros:', filters)

    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    // Construir query params
    const params = new URLSearchParams()
    if (filters?.q) params.append('q', filters.q)
    if (filters?.document) params.append('document', filters.document)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.created_by) params.append('created_by', filters.created_by)
    if (filters?.from_date) params.append('from_date', filters.from_date)
    if (filters?.to_date) params.append('to_date', filters.to_date)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `${API_BASE}/api/blacklist?${params.toString()}`

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
      error instanceof Error ? error.message : 'Error al obtener registros de blacklist'
    console.error('[getBlacklist] Error:', message)
    throw new Error(message)
  }
}
