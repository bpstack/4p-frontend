// app/components/scheduling/ValidationWarnings.tsx
// Component to display validation warnings/violations

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'
import type { GenerationWarning } from '@/app/lib/scheduling/types'

interface ValidationWarningsProps {
  warnings: GenerationWarning[]
  onDismiss?: () => void
}

const SEVERITY_CONFIG_BASE = {
  error: {
    icon: FiAlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500 dark:text-red-400',
  },
  warning: {
    icon: FiAlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  info: {
    icon: FiInfo,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
}

export function ValidationWarnings({ warnings, onDismiss }: ValidationWarningsProps) {
  const t = useTranslations('scheduling.warnings')
  const tTypes = useTranslations('scheduling.warnings.types')
  const [isExpanded, setIsExpanded] = useState(true)

  // Create severity config with translations
  const SEVERITY_CONFIG = {
    error: { ...SEVERITY_CONFIG_BASE.error, label: t('error') },
    warning: { ...SEVERITY_CONFIG_BASE.warning, label: t('warning') },
    info: { ...SEVERITY_CONFIG_BASE.info, label: t('info') },
  }

  // Type labels from translations
  const TYPE_LABELS: Record<string, string> = {
    coverage: tTypes('coverage'),
    night_block: tTypes('nightBlock'),
    rest: tTypes('rest'),
    hours: tTypes('hours'),
    constraint: tTypes('constraint'),
    validation: tTypes('validation'),
  }

  // Helper for pluralization
  const getPlural = (count: number, key: string) =>
    t(key as 'errorsCount' | 'warningsCount' | 'infoCount', { count, plural: count > 1 ? 's' : '' })

  if (!warnings || warnings.length === 0) {
    return null
  }

  // Group warnings by severity
  const errorCount = warnings.filter((w) => w.severity === 'error').length
  const warningCount = warnings.filter((w) => w.severity === 'warning').length
  const infoCount = warnings.filter((w) => w.severity === 'info').length

  // Sort: errors first, then warnings, then info
  const sortedWarnings = [...warnings].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  // Determine overall severity for header
  const overallSeverity = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'info'
  const headerConfig = SEVERITY_CONFIG[overallSeverity]
  const HeaderIcon = headerConfig.icon

  return (
    <div
      className={`rounded-lg border ${headerConfig.borderColor} ${headerConfig.bgColor} overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <HeaderIcon className={`w-5 h-5 ${headerConfig.iconColor}`} />
          <div>
            <span className={`text-sm font-medium ${headerConfig.textColor}`}>
              {errorCount > 0 && getPlural(errorCount, 'errorsCount')}
              {errorCount > 0 && warningCount > 0 && ', '}
              {warningCount > 0 && getPlural(warningCount, 'warningsCount')}
              {(errorCount > 0 || warningCount > 0) && infoCount > 0 && ', '}
              {infoCount > 0 && getPlural(infoCount, 'infoCount')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDismiss()
              }}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          )}
          {isExpanded ? (
            <FiChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <FiChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Warnings List */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedWarnings.map((warning, index) => {
              const config = SEVERITY_CONFIG[warning.severity]
              const Icon = config.icon

              return (
                <li
                  key={index}
                  className="px-4 py-2 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{warning.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {TYPE_LABELS[warning.type] || warning.type}
                      </span>
                      {warning.day && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • {t('day', { day: warning.day })}
                        </span>
                      )}
                      {warning.employeeName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • {warning.employeeName}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
