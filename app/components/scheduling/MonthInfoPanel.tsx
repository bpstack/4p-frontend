// app/components/scheduling/MonthInfoPanel.tsx
// Panel showing employee rules and approved requests

'use client'

import { useQuery } from '@tanstack/react-query'
import { schedulingApi, schedulingKeys } from '@/app/lib/scheduling'
import { FiInfo, FiCalendar, FiUsers } from 'react-icons/fi'

interface MonthInfoPanelProps {
  monthId: number
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function MonthInfoPanel({ monthId }: MonthInfoPanelProps) {
  const { data: monthInfo, isLoading } = useQuery({
    queryKey: schedulingKeys.monthInfo(monthId),
    queryFn: () => schedulingApi.getMonthInfo(monthId),
    enabled: !!monthId,
  })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    )
  }

  if (!monthInfo) {
    return null
  }

  const { requests, employeeRules } = monthInfo

  const hasRequests = requests && requests.length > 0
  const hasRules = employeeRules && employeeRules.length > 0

  if (!hasRequests && !hasRules) {
    return (
      <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <FiInfo className="w-4 h-4" />
          <span>Información del Mes</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
          Sin reglas ni peticiones aprobadas este mes
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <FiInfo className="w-4 h-4" />
        <span>Información del Mes</span>
      </div>

      {/* Responsive layout: 1 column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Approved Requests */}
        {hasRequests && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <FiCalendar className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Peticiones aprobadas ({requests.length})
              </span>
            </div>
            <div className="space-y-1.5 pl-5">
              {requests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
                >
                  <span className="font-medium">{req.employeeName}:</span> {req.typeLabel} (
                  {formatDate(req.startDate)} - {formatDate(req.endDate)})
                  {req.notes && (
                    <span className="text-gray-500 dark:text-gray-500 block sm:inline sm:ml-1 mt-0.5 sm:mt-0">
                      {req.notes.length > 30 ? `${req.notes.substring(0, 30)}...` : req.notes}
                    </span>
                  )}
                </div>
              ))}
              {requests.length > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  +{requests.length - 5} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee Rules */}
        {hasRules && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <FiUsers className="w-3 h-3 text-green-500 shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Empleados con reglas ({employeeRules.length})
              </span>
            </div>
            <div className="space-y-1.5 pl-5">
              {employeeRules.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
                >
                  <span className="font-medium">{emp.employeeName}:</span> {emp.rules.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
