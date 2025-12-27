// app/lib/parking/actions.ts
'use server'

import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/app/lib/env'
import type { ParkingBooking, PaginationInfo } from './types'

const API_BASE = SERVER_API_BASE_URL

export interface BookingFilters {
  status?: 'all' | 'reserved' | 'checked_in' | 'completed' | 'canceled' | 'no_show'
  date?: string
  dateFilter?: 'yesterday' | 'today' | 'tomorrow'
  search?: string
  page?: number
  limit?: number
}

export interface BookingsListResponse {
  success: boolean
  total: number
  pagination: PaginationInfo
  bookings: ParkingBooking[]
  filters_applied?: Record<string, unknown>
}

export async function getBookings(filters?: BookingFilters): Promise<BookingsListResponse> {
  try {
    // Obtener token de cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      throw new Error('No autorizado, falta token')
    }

    // Construir query params
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    if (filters?.date) params.append('date', filters.date)
    if (filters?.search) params.append('q', filters.search)

    // Pagination params
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const url = `${API_BASE}/api/parking/bookings?${params.toString()}`

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
    const message = error instanceof Error ? error.message : 'Error al obtener reservas de parking'
    console.error('[getBookings] Error:', message)
    throw new Error(message)
  }
}
