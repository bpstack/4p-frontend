// app/ui/calendar/HorizontalDatePicker.tsx
// Componente reutilizable para selección de días en formato horizontal
// Usado en: Logbooks, Conciliation, Parking Status

'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export interface HorizontalDatePickerProps {
  /** Current viewing date (controls which month is displayed) */
  currentDate: Date
  /** Currently selected day number */
  selectedDay: number
  /** Callback when selecting a day */
  onSelectDay: (day: number) => void
  /** Locale for weekday formatting (default: 'es-ES') */
  locale?: string
  /** Custom class for the container */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md'
  /** Number of days to show on mobile (default: 5) */
  mobileDaysVisible?: number
}

export default function HorizontalDatePicker({
  currentDate,
  selectedDay,
  onSelectDay,
  locale = 'es-ES',
  className = '',
  size = 'md',
  mobileDaysVisible: _mobileDaysVisible = 5,
}: HorizontalDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(31) // Default to all days
  const [startIndex, setStartIndex] = useState(0)

  // Calculate days in month
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'gap-0.5 px-1 py-2 md:gap-1 md:px-2 md:py-2',
      button: 'w-9 h-10 md:w-9 md:h-10',
      weekday: 'text-[7px] md:text-[8px]',
      day: 'text-[11px] md:text-xs',
      buttonWidth: 36, // w-9 = 36px
      gap: 4, // gap-1 = 4px
    },
    md: {
      container: 'gap-0.5 px-1 py-2 md:gap-1.5 md:px-2 md:py-2',
      button: 'w-10 h-11 md:w-10 md:h-11',
      weekday: 'text-[8px] md:text-[9px]',
      day: 'text-xs md:text-sm',
      buttonWidth: 40, // w-10 = 40px
      gap: 6, // gap-1.5 = 6px
    },
  }

  const sizes = sizeClasses[size]

  // Calculate how many days can fit in the container
  const calculateVisibleCount = useCallback(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    // Account for arrow buttons (32px each + padding) on both sides
    const arrowsWidth = 80
    const availableWidth = containerWidth - arrowsWidth
    const dayWidth = sizes.buttonWidth + sizes.gap
    const count = Math.floor(availableWidth / dayWidth)

    setVisibleCount(Math.max(3, Math.min(count, daysInMonth)))
  }, [daysInMonth, sizes.buttonWidth, sizes.gap])

  // Recalculate on resize
  useEffect(() => {
    calculateVisibleCount()
    window.addEventListener('resize', calculateVisibleCount)
    return () => window.removeEventListener('resize', calculateVisibleCount)
  }, [calculateVisibleCount])

  // Recalculate when month changes
  useEffect(() => {
    calculateVisibleCount()
  }, [currentDate, calculateVisibleCount])

  // Adjust startIndex when selected day changes to keep it visible
  useEffect(() => {
    const selectedIndex = selectedDay - 1
    if (selectedIndex < startIndex) {
      setStartIndex(selectedIndex)
    } else if (selectedIndex >= startIndex + visibleCount) {
      setStartIndex(selectedIndex - visibleCount + 1)
    }
  }, [selectedDay, startIndex, visibleCount])

  // Reset startIndex when month changes
  useEffect(() => {
    setStartIndex(0)
  }, [currentMonth, currentYear])

  // Get visible days based on startIndex and visibleCount
  const visibleDays = allDays.slice(startIndex, startIndex + visibleCount)

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  // Navigation
  const canGoBack = startIndex > 0
  const canGoForward = startIndex + visibleCount < daysInMonth

  const navigateDays = (direction: 'back' | 'forward') => {
    const step = Math.max(1, Math.floor(visibleCount / 2))
    if (direction === 'back') {
      setStartIndex(Math.max(0, startIndex - step))
    } else {
      setStartIndex(Math.min(daysInMonth - visibleCount, startIndex + step))
    }
  }

  // Check if we need navigation arrows (not all days fit)
  const needsNavigation = daysInMonth > visibleCount

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#010409] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      <div className={`flex items-center ${sizes.container}`}>
        {/* Back arrow - show only when needed */}
        {needsNavigation && (
          <button
            onClick={() => navigateDays('back')}
            disabled={!canGoBack}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              canGoBack
                ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
            }`}
            aria-label="Días anteriores"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Days container */}
        <div
          className={`flex flex-1 justify-start overflow-hidden ${needsNavigation ? 'gap-1 md:gap-1.5' : 'gap-1.5 md:gap-2'}`}
        >
          {visibleDays.map((day) => {
            const date = new Date(currentYear, currentMonth, day)
            const weekday = date.toLocaleDateString(locale, { weekday: 'short' })
            const isTodayDay = isToday(day)
            const isSelected = day === selectedDay

            return (
              <button
                key={`day-${currentYear}-${currentMonth}-${day}`}
                onClick={() => onSelectDay(day)}
                className={`
                  flex-shrink-0 rounded-lg font-medium flex flex-col items-center justify-center transition-colors
                  ${sizes.button}
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isTodayDay
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500 dark:ring-blue-400 ring-inset'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span
                  className={`font-normal opacity-80 capitalize leading-tight ${sizes.weekday}`}
                >
                  {weekday.replace('.', '')}
                </span>
                <span className={`font-semibold leading-tight ${sizes.day}`}>{day}</span>
              </button>
            )
          })}
        </div>

        {/* Forward arrow - show only when needed */}
        {needsNavigation && (
          <button
            onClick={() => navigateDays('forward')}
            disabled={!canGoForward}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              canGoForward
                ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
            }`}
            aria-label="Días siguientes"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
