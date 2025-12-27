// app/components/cashier/LoadingState.tsx
'use client'

import { FiLoader } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message }: LoadingStateProps) {
  const t = useTranslations('cashier')
  const displayMessage = message || t('page.loading')
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <FiLoader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{displayMessage}</p>
      </div>
    </div>
  )
}
