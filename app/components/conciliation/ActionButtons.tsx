// app/components/conciliation/ActionButtons.tsx
'use client'

import { FiSave, FiCheck, FiEdit3, FiLock } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import type { ConciliationStatus } from '@/app/lib/conciliation'

interface ActionButtonsProps {
  status: ConciliationStatus
  saving: boolean
  onSave: () => void
  onConfirm: () => void
  onReopen: () => void
  onClose: () => void
}

export default function ActionButtons({
  status,
  saving,
  onSave,
  onConfirm,
  onReopen,
  onClose,
}: ActionButtonsProps) {
  const t = useTranslations('conciliation')
  const isReadOnly = status === 'closed'
  const isDraft = status === 'draft'
  const isConfirmed = status === 'confirmed'

  if (isReadOnly) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <FiLock className="w-5 h-5" />
          <span className="font-medium">{t('actions.closedReadOnly')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
      >
        <FiSave className="w-4 h-4" />
        {saving ? t('actions.saving') : t('actions.saveDraft')}
      </button>

      {isDraft && (
        <button
          onClick={onConfirm}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
        >
          <FiCheck className="w-4 h-4" />
          {t('actions.submit')}
        </button>
      )}

      {isConfirmed && (
        <>
          <button
            onClick={onReopen}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <FiEdit3 className="w-4 h-4" />
            {t('actions.reopen')}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
          >
            <FiLock className="w-4 h-4" />
            {t('actions.closeDefinitely')}
          </button>
        </>
      )}
    </div>
  )
}
