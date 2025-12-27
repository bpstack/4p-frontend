// app/components/maintenance/layout/TabNavigation.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FiFileText, FiClock } from 'react-icons/fi'

interface TabNavigationProps {
  reportId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TabNavigation(_props: TabNavigationProps) {
  const t = useTranslations('maintenance')
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'detail'

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    { id: 'detail', label: t('tabs.detail'), icon: <FiFileText className="w-4 h-4" /> },
    { id: 'history', label: t('tabs.history'), icon: <FiClock className="w-4 h-4" /> },
  ]

  return (
    <div className="bg-white dark:bg-[#010409]">
      <div className="max-w-[1400px] px-4 md:px-6 py-6">
        <nav className="flex gap-4 sm:gap-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  inline-flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-700'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
