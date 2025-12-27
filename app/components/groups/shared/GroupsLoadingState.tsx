// app/components/groups/shared/GroupsLoadingState.tsx

'use client'

import { useTranslations } from 'next-intl'

export function GroupsLoadingState() {
  const t = useTranslations('groups')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010409] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{t('loading')}</p>
      </div>
    </div>
  )
}
