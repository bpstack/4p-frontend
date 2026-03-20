// app/ui/panels/ConfirmDialog.tsx

'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FiTrash2, FiRefreshCw, FiX } from 'react-icons/fi'
import { useTranslations } from 'next-intl'

export type ConfirmDialogVariant = 'danger' | 'warning'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  details?: string[]
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: FiTrash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
  },
  warning: {
    icon: FiRefreshCw,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-400',
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const t = useTranslations('common')
  const resolvedCancelText = cancelText ?? t('actions.cancel')
  const resolvedConfirmText = confirmText ?? t('actions.confirm')

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={isLoading ? () => {} : onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#0d1117] shadow-2xl border border-gray-200/50 dark:border-gray-800/50 transition-all">
                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.iconBg}`}>
                      <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                    <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </Dialog.Title>
                  </div>
                  {!isLoading && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {message}
                  </p>
                  {details && details.length > 0 && (
                    <ul className="space-y-1.5 border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                      {details.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400"
                        >
                          <span className="mt-0.5 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#161b22] border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
                  >
                    {resolvedCancelText}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors ${config.confirmBtn}`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('actions.processing')}
                      </>
                    ) : (
                      resolvedConfirmText
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
