// app/lib/activity/queries.ts

import { apiClient } from '../apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type { ActivityResponse, ActivityFilters, UnifiedActivity } from './types'

/**
 * Obtiene actividad reciente unificada
 */
export async function getRecentActivity(filters: ActivityFilters = {}): Promise<UnifiedActivity[]> {
  const params = new URLSearchParams()

  if (filters.limit) {
    params.append('limit', String(filters.limit))
  }
  if (filters.source) {
    params.append('source', filters.source)
  }
  if (filters.user_id) {
    params.append('user_id', filters.user_id)
  }

  const queryString = params.toString()
  const url = `${API_BASE_URL}/api/activity/recent${queryString ? `?${queryString}` : ''}`

  const response: ActivityResponse = await apiClient.get(url)

  if (!response.success) {
    throw new Error('Error al obtener actividad reciente')
  }

  return response.data
}

// Export individual API functions
export const activityApi = {
  getRecentActivity,
}
