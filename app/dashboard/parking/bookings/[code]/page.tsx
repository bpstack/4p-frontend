// app/dashboard/parking/bookings/[code]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { BookingDetailClient } from '@/app/components/parking'

export default function BookingDetailPage() {
  const params = useParams()
  const code = params.code as string

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010409]">
      <BookingDetailClient code={code} />
    </div>
  )
}
