// app/components/bo/modals/ConfirmDialog.tsx
/**
 * Diálogo de confirmación reutilizable
 * Para acciones destructivas o que requieren confirmación
 */

'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { FiX, FiLoader, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi'

type ConfirmDialogVariant = 'danger' | 'warning' | 'success' | 'info'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  disableConfirm?: boolean
}

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    icon: typeof FiAlertTriangle
    iconBg: string
    iconColor: string
    buttonBg: string
    buttonHover: string
  }
> = {
  danger: {
    icon: FiAlertTriangle,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonBg: 'bg-red-600',
    buttonHover: 'hover:bg-red-700',
  },
  warning: {
    icon: FiAlertTriangle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    buttonBg: 'bg-yellow-600',
    buttonHover: 'hover:bg-yellow-700',
  },
  success: {
    icon: FiCheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    buttonBg: 'bg-green-600',
    buttonHover: 'hover:bg-green-700',
  },
  info: {
    icon: FiInfo,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  disableConfirm = false,
}: ConfirmDialogProps) {
  const t = useTranslations('backoffice')
  const [isPending, startTransition] = useTransition()
  const styles = variantStyles[variant]
  const Icon = styles.icon

  // Use translation defaults if not provided
  const finalConfirmText = confirmText || t('modals.confirm.confirm')
  const finalCancelText = cancelText || t('modals.confirm.cancel')

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-[#151b23] rounded-lg shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div
              className={`mx-auto w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}
            >
              <Icon className={`w-6 h-6 ${styles.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">{message}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {finalCancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending || disableConfirm}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white ${styles.buttonBg} ${styles.buttonHover} rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPending ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    {t('modals.confirm.processing')}
                  </>
                ) : (
                  finalConfirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
