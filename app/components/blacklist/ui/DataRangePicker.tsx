// app/components/ui/DateRangePicker.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DayPicker, DateRange } from 'react-day-picker'
import { IoCalendarOutline } from 'react-icons/io5'
import { clsx } from 'clsx'
import 'react-day-picker/style.css'

interface DateRangePickerProps {
  label?: string
  error?: string
  value?: { from: Date | undefined; to: Date | undefined }
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  required?: boolean
}

export function DateRangePicker({ label, error, value, onChange, required }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (range: DateRange | undefined) => {
    onChange({ from: range?.from, to: range?.to })
  }

  const formatDateRange = () => {
    if (!value?.from) return 'Selecciona fechas'
    if (!value?.to) return format(value.from, 'dd/MM/yyyy', { locale: es })
    return `${format(value.from, 'dd/MM/yyyy', { locale: es })} - ${format(value.to, 'dd/MM/yyyy', { locale: es })}`
  }

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-left',
          'bg-white dark:bg-[#161B22]', // ← bg-white en modo claro
          'text-gray-900 dark:text-gray-100',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
        )}
      >
        <IoCalendarOutline className="text-gray-500 dark:text-gray-400" />
        <span className={clsx(!value?.from && 'text-gray-500 dark:text-gray-400')}>
          {formatDateRange()}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Calendar dropdown */}
          <div className="absolute top-full left-0 mt-2 z-50 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3">
            <DayPicker
              mode="range"
              selected={{ from: value?.from, to: value?.to }}
              onSelect={handleSelect}
              locale={es}
              className="text-sm"
            />
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
