// app/dashboard/maintenance/actions/getMaintenance.ts
'use server'

import { serverFetch } from '@/app/lib/serverFetch'
import type { ReportFilters } from '@/app/lib/maintenance/maintenance'
import type { MaintenanceListResponse } from '@/app/lib/maintenance/maintenanceApi'

const EMPTY_RESPONSE: MaintenanceListResponse = {
  reports: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 100,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  },
}

export async function getMaintenance(
  filters?: ReportFilters & { page?: number; limit?: number }
): Promise<MaintenanceListResponse> {
  // Construir query params
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.priority) params.append('priority', filters.priority)
  if (filters?.location_type) params.append('location_type', filters.location_type)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const endpoint = `/api/maintenance${queryString ? `?${queryString}` : ''}`

  const data = await serverFetch<MaintenanceListResponse>(endpoint)

  // serverFetch returns null on auth failure — return empty data gracefully
  // so the client-side React Query can take over with auto-refresh
  return data ?? EMPTY_RESPONSE
}
