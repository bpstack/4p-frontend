// app/components/groups/shared/EmptyState.tsx

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-400 dark:text-gray-600">{icon}</div>}
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
