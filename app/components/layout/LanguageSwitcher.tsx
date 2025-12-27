// app/components/layout/LanguageSwitcher.tsx
'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { LOCALE_COOKIE, type Locale } from '@/app/i18n/config'

/**
 * Compact language switcher - both flags inline
 */
export default function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale || isPending) return

    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=31536000`

    startTransition(() => {
      window.location.reload()
    })
  }

  return (
    <div className={`flex items-center gap-1 px-4 py-2 ${isPending ? 'opacity-50' : ''}`}>
      <button
        onClick={() => handleLocaleChange('es')}
        disabled={isPending || currentLocale === 'es'}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === 'es'
            ? 'bg-gray-100 dark:bg-gray-700'
            : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        🇪🇸
      </button>
      <span className="text-gray-300 dark:text-gray-600">/</span>
      <button
        onClick={() => handleLocaleChange('en')}
        disabled={isPending || currentLocale === 'en'}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === 'en'
            ? 'bg-gray-100 dark:bg-gray-700'
            : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        🇬🇧
      </button>
    </div>
  )
}
