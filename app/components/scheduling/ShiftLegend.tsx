// app/components/scheduling/ShiftLegend.tsx

'use client'

import type { SchedulingShift } from '@/app/lib/scheduling'
import { getShiftClasses } from '@/app/lib/scheduling'
import { useTranslations } from 'next-intl'

interface ShiftLegendProps {
  shifts: SchedulingShift[]
}

export function ShiftLegend({ shifts }: ShiftLegendProps) {
  const t = useTranslations('scheduling.legend')

  // Group shifts by work/non-work
  const workShifts = shifts.filter((s) => s.isWorkShift)
  const nonWorkShifts = shifts.filter((s) => !s.isWorkShift)

  return (
    <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {/* Work Shifts */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('shifts')}
          </span>
          {workShifts.map((shift) => (
            <div key={shift.code} className="flex items-center gap-1">
              <span
                className={`w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center border ${getShiftClasses(shift.code)}`}
              >
                {shift.code}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{shift.name}</span>
            </div>
          ))}
        </div>

        {/* Non-Work Shifts */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('absences')}
          </span>
          {nonWorkShifts.map((shift) => (
            <div key={shift.code} className="flex items-center gap-1">
              <span
                className={`w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center border ${getShiftClasses(shift.code)}`}
              >
                {shift.code}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{shift.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
