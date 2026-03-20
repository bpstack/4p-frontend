// app/components/scheduling/ScheduleGrid.tsx

'use client'

import { useTranslations } from 'next-intl'
import { useRef, useEffect, useCallback } from 'react'
import { FiLock } from 'react-icons/fi'
import type { SchedulingMonthFull, SchedulingShift, DayOfWeek } from '@/app/lib/scheduling'
import { getShiftClasses } from '@/app/lib/scheduling'

// ============================================================
// TYPES
// ============================================================

export interface BulkSelection {
  employeeId: string
  employeeName: string
  cells: Array<{ dayId: number; dayNumber: number; assignmentId: number | null }>
  position: { x: number; y: number }
}

interface ScheduleGridProps {
  monthData: SchedulingMonthFull
  shiftsMap: Record<string, SchedulingShift>
  onCellClick?: (
    employeeId: string,
    dayId: number,
    currentShift: string | null,
    event: React.MouseEvent
  ) => void
  onBulkCellSelect?: (selection: BulkSelection) => void
  editable?: boolean
}

// ============================================================
// CONSTANTS
// ============================================================

const DAY_NAMES: Record<DayOfWeek, string> = {
  L: 'Lun',
  M: 'Mar',
  X: 'Mié',
  J: 'Jue',
  V: 'Vie',
  S: 'Sáb',
  D: 'Dom',
}

const STATS_COLUMNS = [
  { key: 'M', label: 'M', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'T', label: 'T', color: 'text-orange-600 dark:text-orange-400' },
  { key: 'N', label: 'N', color: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'L', label: 'L', color: 'text-green-600 dark:text-green-400' },
  { key: 'V', label: 'V', color: 'text-purple-600 dark:text-purple-400' },
  { key: 'B', label: 'B', color: 'text-rose-600 dark:text-rose-400' },
] as const

// ============================================================
// COMPONENT
// ============================================================

export function ScheduleGrid({
  monthData,
  shiftsMap,
  onCellClick,
  onBulkCellSelect,
  editable = false,
}: ScheduleGridProps) {
  const t = useTranslations('scheduling')
  const { days, employees, dailyStats } = monthData

  // ============================================================
  // DRAG-TO-SELECT LOGIC
  // ============================================================

  // Keep props/data in sync for use inside the stable global listener.
  // No deps array → runs after every render to always be fresh.
  const latestRef = useRef({ onCellClick, onBulkCellSelect, employees, days })
  useEffect(() => {
    latestRef.current = { onCellClick, onBulkCellSelect, employees, days }
  })

  // Mutable drag state (never triggers re-renders)
  const dragRef = useRef({
    active: false,
    employeeId: '',
    employeeName: '',
    dayIds: new Set<number>(),
  })

  // Map of dayId → button element for direct DOM highlight (bypasses React diffing)
  // Key format: `${employeeId}:${dayId}`
  const cellButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const setHighlight = useCallback((employeeId: string, dayId: number, on: boolean) => {
    const btn = cellButtonRefs.current.get(`${employeeId}:${dayId}`)
    if (!btn) return
    if (on) btn.setAttribute('data-drag-selected', 'true')
    else btn.removeAttribute('data-drag-selected')
  }, [])

  // Single global mouseup listener — registered once, reads from refs for fresh data.
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current.active) return

      const { employeeId, employeeName, dayIds } = dragRef.current
      const { employees, days, onCellClick, onBulkCellSelect } = latestRef.current

      // Clear all highlights
      dayIds.forEach((dayId) => setHighlight(employeeId, dayId, false))

      // Reset drag state and restore text selection
      dragRef.current = { active: false, employeeId: '', employeeName: '', dayIds: new Set() }
      document.body.style.userSelect = ''

      if (dayIds.size === 0) return

      if (dayIds.size === 1) {
        // Single cell — delegate to the existing single-click handler
        const dayId = Array.from(dayIds)[0]
        const employee = employees.find((emp) => emp.id === employeeId)
        const day = days.find((d) => d.id === dayId)
        if (employee && day) {
          const assignment = employee.assignments[day.dayNumber]
          onCellClick?.(
            employeeId,
            dayId,
            assignment?.shiftCode ?? null,
            e as unknown as React.MouseEvent
          )
        }
        return
      }

      // Multiple cells — build bulk selection and notify parent
      const employee = employees.find((emp) => emp.id === employeeId)
      if (!employee) return

      const cells = Array.from(dayIds)
        .map((dayId) => {
          const day = days.find((d) => d.id === dayId)
          if (!day) return null
          const assignment = employee.assignments[day.dayNumber]
          return {
            dayId,
            dayNumber: day.dayNumber,
            assignmentId: assignment?.id ?? null,
          }
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a, b) => a.dayNumber - b.dayNumber)

      onBulkCellSelect?.({
        employeeId,
        employeeName,
        cells,
        position: { x: e.clientX, y: e.clientY },
      })
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [setHighlight])

  const handleCellMouseDown = useCallback(
    (employeeId: string, employeeName: string, dayId: number, e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault() // prevent text selection during drag
      document.body.style.userSelect = 'none'

      dragRef.current = {
        active: true,
        employeeId,
        employeeName,
        dayIds: new Set([dayId]),
      }
      setHighlight(employeeId, dayId, true)
    },
    [setHighlight]
  )

  const handleCellMouseEnter = useCallback(
    (employeeId: string, dayId: number) => {
      const drag = dragRef.current
      if (!drag.active || drag.employeeId !== employeeId) return
      if (drag.dayIds.has(dayId)) return

      drag.dayIds.add(dayId)
      setHighlight(employeeId, dayId, true)
    },
    [setHighlight]
  )

  const isWeekend = (dayOfWeek: DayOfWeek) => dayOfWeek === 'S' || dayOfWeek === 'D'
  const isSaturday = (dayOfWeek: DayOfWeek) => dayOfWeek === 'S'
  const isSunday = (dayOfWeek: DayOfWeek) => dayOfWeek === 'D'

  return (
    <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          {/* Header */}
          <thead>
            <tr className="bg-gray-50 dark:bg-[#0d1117]">
              <th className="sticky left-0 z-20 bg-gray-50 dark:bg-[#0d1117] px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700 min-w-[120px] shadow-[2px_0_4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                {t('grid.employee')}
              </th>
              {days.map((day) => {
                const weekend = isWeekend(day.dayOfWeek)
                const saturday = isSaturday(day.dayOfWeek)
                const sunday = isSunday(day.dayOfWeek)
                const holiday = day.isHoliday
                return (
                  <th
                    key={day.id}
                    title={holiday && day.holidayName ? day.holidayName : undefined}
                    className={[
                      'px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider min-w-[36px]',
                      // Weekend: violet accent header with stronger bottom border
                      weekend && !holiday
                        ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-b-2 border-b-violet-300 dark:border-b-violet-700'
                        : 'text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700',
                      // Saturday gets a left border to open the weekend block
                      saturday ? 'border-l-2 border-l-violet-300 dark:border-l-violet-700' : '',
                      // Sunday gets a right border to close the weekend block
                      sunday ? 'border-r-2 border-r-violet-300 dark:border-r-violet-700' : '',
                      // Holiday overrides
                      holiday
                        ? 'bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={holiday ? 'text-red-600 dark:text-red-400' : ''}>
                        {DAY_NAMES[day.dayOfWeek]}
                      </span>
                      <span
                        className={[
                          'text-[11px] font-bold',
                          holiday
                            ? 'text-red-600 dark:text-red-400'
                            : weekend
                              ? 'text-violet-800 dark:text-violet-200'
                              : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                  </th>
                )
              })}
              <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-l border-gray-200 dark:border-gray-700 min-w-[36px] bg-gray-100 dark:bg-gray-800/50">
                {t('grid.total')}
              </th>
              {STATS_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[32px] bg-gray-100 dark:bg-gray-800/50 ${col.color}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={days.length + 2 + STATS_COLUMNS.length}
                  className="px-3 py-8 text-center text-xs text-gray-500 dark:text-gray-400"
                >
                  {t('grid.noEmployees')}
                </td>
              </tr>
            ) : (
              employees.map((employee, empIndex) => {
                const totalWorkShifts = Object.values(employee.assignments).filter(
                  (a) => a && shiftsMap[a.shiftCode]?.isWorkShift
                ).length

                return (
                  <tr
                    key={employee.id}
                    className={`${
                      empIndex % 2 === 0
                        ? 'bg-white dark:bg-[#151b23]'
                        : 'bg-gray-50/50 dark:bg-[#0d1117]/50'
                    } hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors`}
                  >
                    {/* Employee Name */}
                    <td
                      className={`sticky left-0 z-10 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap shadow-[2px_0_4px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.2)] ${
                        empIndex % 2 === 0
                          ? 'bg-white dark:bg-[#151b23]'
                          : 'bg-gray-50 dark:bg-[#0d1117]'
                      }`}
                    >
                      {employee.name}
                    </td>

                    {/* Day Cells */}
                    {days.map((day) => {
                      const assignment = employee.assignments[day.dayNumber]
                      const shiftCode = assignment?.shiftCode || null
                      const isLockedByConstraint = Boolean(assignment?.sourceConstraintId)
                      const canEditCell = editable && !isLockedByConstraint
                      const shiftClasses = getShiftClasses(shiftCode)
                      const cellKey = `${employee.id}:${day.id}`
                      const weekend = isWeekend(day.dayOfWeek)
                      const saturday = isSaturday(day.dayOfWeek)
                      const sunday = isSunday(day.dayOfWeek)

                      return (
                        <td
                          key={day.id}
                          className={[
                            'px-0.5 py-1 text-center',
                            weekend
                              ? 'bg-violet-50/60 dark:bg-violet-950/25'
                              : 'border-gray-100 dark:border-gray-800',
                            saturday
                              ? 'border-l-2 border-l-violet-200 dark:border-l-violet-800/60'
                              : '',
                            sunday
                              ? 'border-r-2 border-r-violet-200 dark:border-r-violet-800/60'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <button
                            ref={(el) => {
                              if (el) cellButtonRefs.current.set(cellKey, el)
                              else cellButtonRefs.current.delete(cellKey)
                            }}
                            onMouseDown={
                              canEditCell
                                ? (e) => handleCellMouseDown(employee.id, employee.name, day.id, e)
                                : undefined
                            }
                            onMouseEnter={
                              canEditCell
                                ? () => handleCellMouseEnter(employee.id, day.id)
                                : undefined
                            }
                            disabled={!canEditCell}
                            className={`
                              relative overflow-hidden w-8 h-6 rounded text-[10px] font-bold border transition-all
                              ${canEditCell ? 'cursor-pointer hover:scale-110 hover:shadow-md' : 'cursor-default'}
                              ${isLockedByConstraint ? 'opacity-70 border-gray-400 dark:border-gray-600' : ''}
                              ${shiftClasses}
                            `}
                            title={
                              isLockedByConstraint
                                ? 'Celda bloqueada por petición aprobada'
                                : shiftCode
                                  ? shiftsMap[shiftCode]?.name
                                  : t('grid.unassigned')
                            }
                          >
                            <span className="inline-flex items-center justify-center w-full h-full">
                              {shiftCode === 'L' && assignment?.libreNumber
                                ? `L${assignment.libreNumber}`
                                : shiftCode || '-'}
                            </span>
                            {isLockedByConstraint && (
                              <FiLock className="absolute top-0.5 right-0.5 w-2 h-2 text-fuchsia-600 dark:text-fuchsia-400" />
                            )}
                          </button>
                        </td>
                      )
                    })}

                    {/* Total + Stats columns */}
                    <td className="px-1 py-1.5 text-center text-[10px] font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                      {totalWorkShifts}
                    </td>
                    {STATS_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="px-1 py-1.5 text-center text-[10px] font-medium bg-gray-50 dark:bg-gray-800/30"
                      >
                        <span className={col.color}>
                          {employee.stats?.[col.key as keyof typeof employee.stats] || 0}
                        </span>
                      </td>
                    ))}
                  </tr>
                )
              })
            )}

            {/* Footer - Daily Totals */}
            {employees.length > 0 && (
              <>
                {/* Helper: renders footer stat cells with weekend tint */}
                {(
                  [
                    {
                      label: t('grid.morning'),
                      getValue: (s: (typeof dailyStats)[0]) => s.M,
                      colorFn: (v: number) =>
                        v === 0
                          ? 'text-red-500 dark:text-red-600'
                          : 'text-amber-600 dark:text-amber-600/90',
                      extraCols: (
                        <td
                          colSpan={STATS_COLUMNS.length}
                          className="bg-gray-50 dark:bg-[#161b22]"
                        ></td>
                      ),
                      borderTop: true,
                    },
                    {
                      label: t('grid.afternoon'),
                      getValue: (s: (typeof dailyStats)[0]) => s.T,
                      colorFn: (v: number) =>
                        v === 0
                          ? 'text-red-500 dark:text-red-600'
                          : 'text-orange-600 dark:text-orange-600/90',
                      extraCols: null,
                      borderTop: false,
                    },
                    {
                      label: t('grid.night'),
                      getValue: (s: (typeof dailyStats)[0]) => s.N,
                      colorFn: (v: number) =>
                        v === 0
                          ? 'text-red-500 dark:text-red-600'
                          : 'text-indigo-600 dark:text-indigo-500/90',
                      extraCols: null,
                      borderTop: false,
                    },
                    {
                      label: t('grid.internalSupport'),
                      getValue: (s: (typeof dailyStats)[0]) => s.PI || 0,
                      colorFn: (v: number) =>
                        v === 0
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-cyan-600 dark:text-cyan-600/90',
                      extraCols: null,
                      borderTop: false,
                    },
                    {
                      label: t('grid.support'),
                      getValue: (s: (typeof dailyStats)[0]) => s.P || 0,
                      colorFn: (v: number) =>
                        v === 0
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-teal-600 dark:text-teal-600/90',
                      extraCols: null,
                      borderTop: false,
                    },
                  ] as const
                ).map((row) => (
                  <tr
                    key={row.label}
                    className={`bg-gray-100 dark:bg-[#161b22]${row.borderTop ? ' border-t-2 border-gray-300 dark:border-gray-700' : ''}`}
                  >
                    <td className="sticky left-0 z-10 bg-gray-100 dark:bg-[#161b22] px-3 py-1.5 text-[10px] font-semibold text-gray-600 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 shadow-[2px_0_4px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.2)]">
                      {row.label}
                    </td>
                    {dailyStats.map((stat, i) => {
                      const day = days[i]
                      const wknd = day ? isWeekend(day.dayOfWeek) : false
                      const sat = day ? isSaturday(day.dayOfWeek) : false
                      const sun = day ? isSunday(day.dayOfWeek) : false
                      const val = row.getValue(stat)
                      return (
                        <td
                          key={i}
                          className={[
                            'px-0.5 py-1 text-center',
                            wknd ? 'bg-violet-100/50 dark:bg-violet-950/20' : '',
                            sat ? 'border-l-2 border-l-violet-200 dark:border-l-violet-800/60' : '',
                            sun ? 'border-r-2 border-r-violet-200 dark:border-r-violet-800/60' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <span className={`text-[10px] font-bold ${row.colorFn(val)}`}>{val}</span>
                        </td>
                      )
                    })}
                    <td className="px-2 py-1 text-center text-[10px] font-bold text-gray-600 dark:text-gray-500 border-l border-gray-200 dark:border-gray-700">
                      {dailyStats.reduce((sum, s) => sum + row.getValue(s), 0)}
                    </td>
                    {row.extraCols}
                  </tr>
                ))}

                <tr className="bg-gray-200 dark:bg-[#1c2128] border-t border-gray-300 dark:border-gray-700">
                  <td className="sticky left-0 z-10 bg-gray-200 dark:bg-[#1c2128] px-3 py-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 shadow-[2px_0_4px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_4px_rgba(0,0,0,0.2)]">
                    {t('grid.totalLabel')}
                  </td>
                  {dailyStats.map((stat, i) => {
                    const day = days[i]
                    const wknd = day ? isWeekend(day.dayOfWeek) : false
                    const sat = day ? isSaturday(day.dayOfWeek) : false
                    const sun = day ? isSunday(day.dayOfWeek) : false
                    const total = stat.M + stat.T + stat.N + (stat.PI || 0) + (stat.P || 0)
                    return (
                      <td
                        key={i}
                        className={[
                          'px-0.5 py-1 text-center',
                          wknd ? 'bg-violet-200/40 dark:bg-violet-950/30' : '',
                          sat ? 'border-l-2 border-l-violet-300 dark:border-l-violet-700/60' : '',
                          sun ? 'border-r-2 border-r-violet-300 dark:border-r-violet-700/60' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <span
                          className={`text-[10px] font-bold ${total < 3 ? 'text-red-600 dark:text-red-600' : total < 5 ? 'text-amber-600 dark:text-amber-600/90' : 'text-green-600 dark:text-green-600/90'}`}
                        >
                          {total}
                        </span>
                      </td>
                    )
                  })}
                  <td className="px-2 py-1 text-center text-[10px] font-bold text-gray-700 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">
                    {dailyStats.reduce(
                      (sum, s) => sum + s.M + s.T + s.N + (s.PI || 0) + (s.P || 0),
                      0
                    )}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
