// app/components/scheduling/ScheduleStats.tsx

'use client'

import type { SchedulingMonthFull } from '@/app/lib/scheduling'
import { FiUsers, FiSun, FiMoon, FiClock } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface ScheduleStatsProps {
  monthData: SchedulingMonthFull
}

export function ScheduleStats({ monthData }: ScheduleStatsProps) {
  const t = useTranslations('scheduling.stats')
  const { employees, dailyStats } = monthData

  // Calculate totals
  const totalEmployees = employees.length
  const _totalWorkDays = monthData.days.filter((d) => !d.isHoliday).length

  // Sum up shifts across all days
  const totalM = dailyStats.reduce((sum, d) => sum + d.M, 0)
  const totalT = dailyStats.reduce((sum, d) => sum + d.T, 0)
  const totalN = dailyStats.reduce((sum, d) => sum + d.N, 0)

  // Calculate coverage issues
  const daysWithoutMorning = dailyStats.filter((d) => d.M === 0).length
  const daysWithoutAfternoon = dailyStats.filter((d) => d.T === 0).length
  const daysWithoutNight = dailyStats.filter((d) => d.N === 0).length

  const hasCoverageIssues =
    daysWithoutMorning > 0 || daysWithoutAfternoon > 0 || daysWithoutNight > 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
      {/* Employees */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('employees')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {totalEmployees}
            </p>
          </div>
          <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
        </div>
      </div>

      {/* Morning Shifts */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('morningShifts')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {totalM}
            </p>
            {daysWithoutMorning > 0 && (
              <p className="text-[10px] text-red-500 dark:text-red-400">
                {t('daysWithoutMorning', { count: daysWithoutMorning })}
              </p>
            )}
          </div>
          <FiSun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400" />
        </div>
      </div>

      {/* Afternoon Shifts */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('afternoonShifts')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {totalT}
            </p>
            {daysWithoutAfternoon > 0 && (
              <p className="text-[10px] text-red-500 dark:text-red-400">
                {t('daysWithoutAfternoon', { count: daysWithoutAfternoon })}
              </p>
            )}
          </div>
          <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 dark:text-orange-400" />
        </div>
      </div>

      {/* Night Shifts */}
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('nightShifts')}
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {totalN}
            </p>
            {daysWithoutNight > 0 && (
              <p className="text-[10px] text-red-500 dark:text-red-400">
                {t('daysWithoutNight', { count: daysWithoutNight })}
              </p>
            )}
          </div>
          <FiMoon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      {/* Coverage Status */}
      <div
        className={`col-span-2 lg:col-span-1 rounded-md border p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow ${
          hasCoverageIssues
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t('coverage')}
            </p>
            <p
              className={`text-sm sm:text-base font-bold mt-0.5 ${
                hasCoverageIssues
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-green-700 dark:text-green-400'
              }`}
            >
              {hasCoverageIssues ? t('incomplete') : t('complete')}
            </p>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              hasCoverageIssues
                ? 'bg-red-100 dark:bg-red-900/40'
                : 'bg-green-100 dark:bg-green-900/40'
            }`}
          >
            {hasCoverageIssues ? (
              <span className="text-red-600 dark:text-red-400 text-lg">!</span>
            ) : (
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
