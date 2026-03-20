// app/components/scheduling/ShiftSelector.tsx

'use client'

import { useEffect, useRef } from 'react'
import type { SchedulingShift } from '@/app/lib/scheduling'
import { getShiftClasses } from '@/app/lib/scheduling'
import { FiX } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface ShiftSelectorProps {
  shifts: SchedulingShift[]
  currentShiftCode: string | null
  employeeName: string
  /** Day number for single-cell mode */
  dayNumber?: number
  /** Override subtitle text (used for multi-cell bulk mode) */
  subtitle?: string
  position: { x: number; y: number }
  onSelect: (shiftCode: string) => void
  onClose: () => void
  isLoading?: boolean
}

export function ShiftSelector({
  shifts,
  currentShiftCode,
  employeeName,
  dayNumber,
  subtitle,
  position,
  onSelect,
  onClose,
  isLoading = false,
}: ShiftSelectorProps) {
  const t = useTranslations('scheduling.shiftSelector')
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedPosition = {
    left: Math.min(position.x, window.innerWidth - 280),
    top: Math.min(position.y, window.innerHeight - 200),
  }

  // Sort shifts: work shifts first, then others
  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.isWorkShift !== b.isWorkShift) return a.isWorkShift ? -1 : 1
    return a.displayOrder - b.displayOrder
  })

  // Group shifts
  const workShifts = sortedShifts.filter((s) => s.isWorkShift)
  const nonWorkShifts = sortedShifts.filter((s) => !s.isWorkShift)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white dark:bg-[#1c2128] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
    >
      {/* Header */}
      <div className="px-2.5 py-1.5 bg-gray-50 dark:bg-[#151b23] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{employeeName}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            {subtitle ?? (dayNumber !== undefined ? t('day', { day: dayNumber }) : '')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Shift options */}
      <div className="p-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
          </div>
        ) : (
          <>
            {/* Work shifts */}
            {workShifts.length > 0 && (
              <div className="mb-1.5">
                <p className="px-0.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('work')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {workShifts.map((shift) => (
                    <ShiftButton
                      key={shift.code}
                      shift={shift}
                      isSelected={shift.code === currentShiftCode}
                      onClick={() => onSelect(shift.code)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Non-work shifts (libres, vacaciones, etc) */}
            {nonWorkShifts.length > 0 && (
              <div>
                <p className="px-0.5 py-0.5 text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('absences')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {nonWorkShifts.map((shift) => (
                    <ShiftButton
                      key={shift.code}
                      shift={shift}
                      isSelected={shift.code === currentShiftCode}
                      onClick={() => onSelect(shift.code)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ShiftButton({
  shift,
  isSelected,
  onClick,
}: {
  shift: SchedulingShift
  isSelected: boolean
  onClick: () => void
}) {
  const shiftClasses = getShiftClasses(shift.code)

  return (
    <button
      onClick={onClick}
      className={`
        w-7 h-7 rounded text-xs font-bold border transition-all
        ${shiftClasses}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-[#1c2128]' : ''}
        hover:scale-110 hover:shadow-md
      `}
      title={shift.name}
    >
      {shift.code}
    </button>
  )
}
