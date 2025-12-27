// app/dashboard/parking/actions/getParkingDashboardStats.ts
'use server'

import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

export interface ParkingStats {
  total_spots: number
  occupied_spots: number
  available_spots: number
  total_bookings: number
  pending_checkins: number
  pending_checkouts: number
  active_bookings: number
  completed_today: number
  canceled_today: number
  no_shows_today: number
  occupancy_rate: number
}

export interface OccupancyLevel {
  level: string
  total_spots: number
  occupied_spots: number
  available_spots: number
  total_bookings?: number
  max_occupied?: number
  min_occupied?: number
  occupancy_rate: number
}

export interface ParkingDashboardResponse {
  success: boolean
  period: {
    type: string
    date?: string
    startDate?: string
    endDate?: string
    days?: number
  }
  dashboard: {
    stats: ParkingStats
    occupancy: {
      levels: OccupancyLevel[]
      summary: OccupancyLevel
    }
  }
}

/**
 * Server Action para obtener stats del dashboard de parking
 * @param period - 'today' | 'week' | 'month'
 * @param dateRange - Para week/month, contiene { start, end }
 */
export async function getParkingDashboardStats(
  period: 'today' | 'week' | 'month' = 'today',
  dateRange?: { start: string; end: string }
): Promise<ParkingDashboardResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    let url: string

    if (period === 'today') {
      // Sin parámetros - el backend usa la fecha actual (Madrid timezone)
      url = `${API_BASE}/api/parking/stats`
    } else if (dateRange) {
      // Para week/month, usar rango de fechas
      url = `${API_BASE}/api/parking/stats?startDate=${dateRange.start}&endDate=${dateRange.end}`
    } else {
      // Fallback a today si no hay rango
      url = `${API_BASE}/api/parking/stats`
    }

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
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas'
    console.error('[getParkingDashboardStats] Error:', message)
    throw new Error(message)
  }
}
