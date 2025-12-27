// app/components/cashier/ErrorState.tsx
'use client'

import { FiAlertCircle } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface ErrorStateProps {
  title?: string
  message: string
}

export default function ErrorState({ title, message }: ErrorStateProps) {
  const t = useTranslations('cashier')
  const displayTitle = title || t('error.title')
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">{displayTitle}</h3>
          <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
        </div>
      </div>
    </div>
  )
}
