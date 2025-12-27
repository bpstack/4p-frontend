// app/components/groups/shared/StatusBadge.tsx

'use client'

import { GroupStatus } from '@/app/lib/groups'
import { useTranslations } from 'next-intl'

interface StatusBadgeProps {
  status: GroupStatus
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const t = useTranslations('groups')

  const colorConfigs: Record<GroupStatus, string> = {
    pending:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    confirmed:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    in_progress:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    completed:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    cancelled:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  }

  const color = colorConfigs[status]
  const label = t(`status.${status}`)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${color} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  )
}
