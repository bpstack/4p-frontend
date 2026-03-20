// app/lib/scheduling/server.ts
// Server-side data fetching for scheduling module (SSR)

import { serverFetch } from '@/app/lib/serverFetch'
import type { SchedulingShift, SchedulingMonth, SchedulingMonthFull } from './types'

/**
 * Fetch shifts (server-side)
 */
export async function getShiftsServer(): Promise<SchedulingShift[]> {
  const data = await serverFetch<SchedulingShift[]>('/api/scheduling/shifts')
  return data || []
}

/**
 * Fetch months list for a year (server-side)
 */
export async function getMonthsServer(year: number): Promise<{
  months: SchedulingMonth[]
  total: number
}> {
  const data = await serverFetch<{ months: SchedulingMonth[]; total: number }>(
    `/api/scheduling/months?year=${year}`
  )
  return data || { months: [], total: 0 }
}

/**
 * Fetch full month data (server-side)
 */
export async function getMonthByIdServer(monthId: number): Promise<SchedulingMonthFull | null> {
  return serverFetch<SchedulingMonthFull>(`/api/scheduling/months/${monthId}`)
}

/**
 * Find current or most recent month ID for a year
 */
export function findCurrentMonthId(months: SchedulingMonth[], year: number): number | null {
  if (months.length === 0) return null

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // If viewing current year, try to find current month
  if (year === currentYear) {
    const current = months.find((m) => m.month === currentMonth)
    if (current) return current.id
  }

  // Otherwise, return the most recent month
  const sorted = [...months].sort((a, b) => b.month - a.month)
  return sorted[0]?.id || null
}

/**
 * Fetch all initial data for scheduling page
 */
export async function getSchedulingInitialData(year: number) {
  // Parallel fetch for better performance
  const [shifts, monthsData] = await Promise.all([getShiftsServer(), getMonthsServer(year)])

  // Find default month to load
  const defaultMonthId = findCurrentMonthId(monthsData.months, year)

  // Fetch month data if we have a default
  let monthData: SchedulingMonthFull | null = null
  if (defaultMonthId) {
    monthData = await getMonthByIdServer(defaultMonthId)
  }

  return {
    shifts,
    months: monthsData.months,
    monthData,
    defaultMonthId,
  }
}

// Types for initial data props
export interface SchedulingInitialData {
  shifts: SchedulingShift[]
  months: SchedulingMonth[]
  monthData: SchedulingMonthFull | null
  defaultMonthId: number | null
}
