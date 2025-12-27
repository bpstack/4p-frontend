// app/dashboard/cashier/hotel/layout.tsx
'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/app/lib/auth/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { useCashierStore } from '@/app/stores/useCashierStore'
import CashierCalendarNav from '@/app/components/cashier/CashierCalendarNav'
import HorizontalDatePicker from '@/app/ui/calendar/HorizontalDatePicker'

export default function CashierLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Zustand store
  const {
    selectedDate,
    currentDate,
    selectedDay,
    getCurrentMonth,
    getCurrentYear,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDay,
  } = useCashierStore()

  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()

  // Wrapper para invalidar queries al cambiar fecha
  const handlePreviousMonth = () => {
    queryClient.removeQueries({ queryKey: ['cashier'] })
    goToPreviousMonth()
  }

  const handleNextMonth = () => {
    queryClient.removeQueries({ queryKey: ['cashier'] })
    goToNextMonth()
  }

  const handleToday = () => {
    queryClient.removeQueries({ queryKey: ['cashier'] })
    goToToday()
  }

  const handleDayClick = (day: number) => {
    queryClient.removeQueries({ queryKey: ['cashier'] })
    selectDay(day)
  }

  return (
    <div className="space-y-6">
      <CashierCalendarNav
        currentMonth={currentMonth}
        currentYear={currentYear}
        selectedDate={selectedDate}
        username={user?.username}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      <HorizontalDatePicker
        currentDate={currentDate}
        selectedDay={selectedDay}
        onSelectDay={handleDayClick}
        locale="en-US"
        className="sticky top-[64px] z-30"
      />

      {/* Contenido dinámico */}
      <div className="max-w-[1400px] px-4 md:px-6">{children}</div>
    </div>
  )
}
