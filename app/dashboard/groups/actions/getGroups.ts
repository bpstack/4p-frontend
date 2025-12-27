// app/dashboard/groups/actions/getGroups.ts
'use server'

import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/app/lib/env'
import type { Group, GroupFilters } from '@/app/lib/groups/types'

const API_BASE = SERVER_API_BASE_URL

export interface GroupsListResponse {
  success: boolean
  data: Group[]
  count: number
}

export async function getGroups(filters?: GroupFilters): Promise<GroupsListResponse> {
  try {
    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    // Construir query params
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    const queryString = params.toString()
    const url = `${API_BASE}/api/groups${queryString ? `?${queryString}` : ''}`

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
    const message = error instanceof Error ? error.message : 'Error al obtener grupos'
    console.error('[getGroups] Error:', message)
    throw new Error(message)
  }
}
