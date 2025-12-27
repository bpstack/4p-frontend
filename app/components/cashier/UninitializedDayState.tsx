// app/components/cashier/UninitializedDayState.tsx
'use client'

import { FiDollarSign } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

interface UninitializedDayStateProps {
  onInitialize: () => void
}

export default function UninitializedDayState({ onInitialize }: UninitializedDayStateProps) {
  const t = useTranslations('cashier')

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
      <FiDollarSign className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">
        {t('uninitializedDay.title')}
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
        {t('uninitializedDay.message')}
      </p>
      <button
        onClick={onInitialize}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
      >
        <FiDollarSign className="w-4 h-4" />
        {t('uninitializedDay.initializeButton')}
      </button>
    </div>
  )
}
