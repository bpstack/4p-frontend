// app/components/maintenance/shared/EmptyState.tsx

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 dark:text-gray-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
