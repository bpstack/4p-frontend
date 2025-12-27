// app/dashboard/bo/error.tsx
/**
 * Error Boundary for Back Office Route
 *
 * Catches errors during rendering or data fetching.
 * Must be a Client Component to handle interactive recovery.
 */

'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BackOfficeError({ error, reset }: ErrorProps) {
  const t = useTranslations('backoffice')

  useEffect(() => {
    // Log error to monitoring service
    console.error('Back Office error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1600px]">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('error.title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {t('error.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Error Card */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-white dark:bg-[#151b23] rounded-lg border border-red-200 dark:border-red-800/50 shadow-sm p-8 max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <FiAlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('error.errorTitle')}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('error.errorDescription')}
            </p>

            {/* Error details (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-gray-500 dark:text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  {t('error.errorDetails')}
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                {t('error.retry')}
              </button>

              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('error.backToDashboard')}
              </a>
            </div>
          </div>

          {/* Help text */}
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-500 text-center max-w-md">
            {t('error.helpText')}
          </p>
        </div>
      </div>
    </div>
  )
}
