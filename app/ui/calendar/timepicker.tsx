//app/ui/calendar/timepicker.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { FiClock } from 'react-icons/fi'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  openTo?: 'right' | 'left'
  label?: string
  openDirection?: 'up' | 'down'
  minTime?: string // Nueva prop: hora mínima (formato HH:mm)
  forDate?: Date | null // Nueva prop: fecha seleccionada (para validar si es hoy)
}

export default function TimePicker({
  value,
  onChange,
  openTo = 'right',
  label,
  openDirection = 'down',
  minTime,
  forDate,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Genera intervalos de 30 minutos
  const times: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      times.push(`${hh}:${mm}`)
    }
  }

  // Verificar si una hora está deshabilitada
  const isTimeDisabled = (time: string): boolean => {
    if (!minTime || !forDate) return false

    // Solo aplicar restricción si la fecha es hoy
    const today = new Date()
    const isToday =
      forDate.getFullYear() === today.getFullYear() &&
      forDate.getMonth() === today.getMonth() &&
      forDate.getDate() === today.getDate()

    if (!isToday) return false

    return time < minTime
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
      >
        <span className="font-mono">{value}</span>
        <FiClock className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div
          className={`absolute z-20 ${
            openDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${
            openTo === 'left' ? 'right-0' : 'left-0'
          } w-full sm:w-auto bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg`}
        >
          <div className="p-2 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-4 sm:grid-cols-2 gap-1">
              {times.map((time) => {
                const disabled = isTimeDisabled(time)
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) {
                        onChange(time)
                        setOpen(false)
                      }
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                      disabled
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : time === value
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
