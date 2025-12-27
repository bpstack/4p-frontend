// app/dashboard/parking/bookings/new/page.tsx

'use client'

import BookingWizard from '@/app/components/booking/BookingWizard'

export default function NewReservationPage() {
  return (
    <BookingWizard
      variant="full"
      onSuccess={() => {
        window.location.href = '/dashboard/parking/bookings'
      }}
    />
  )
}
