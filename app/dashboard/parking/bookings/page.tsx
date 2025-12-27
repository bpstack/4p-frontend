// app/dashboard/parking/bookings/page.tsx

import { getBookings, type BookingFilters } from '@/app/lib/parking'
import { BookingsListClient } from '@/app/components/parking'

interface PageProps {
  searchParams: Promise<{
    status?: string
    date?: string
    dateFilter?: string
    search?: string
    page?: string
  }>
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = params.page ? parseInt(params.page) : 1

  // Construir filtros desde URL
  const filters = {
    status: params.status as BookingFilters['status'],
    date: params.date,
    dateFilter: params.dateFilter as BookingFilters['dateFilter'],
    search: params.search,
    page: currentPage,
    limit: 50,
  }

  let data
  let error: string | null = null

  try {
    data = await getBookings(filters)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[BookingsPage] Error:', message)
    error = message
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#010409] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <BookingsListClient
      initialBookings={data?.bookings || []}
      initialTotal={data?.total || 0}
      initialPagination={data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 }}
    />
  )
}
