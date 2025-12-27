// app/components/bo/TabsNavigation.tsx
/**
 * Client Component - Tab Navigation
 *
 * Handles interactive tab switching using URL search params.
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FiClock, FiCheckCircle, FiUsers, FiSettings } from 'react-icons/fi'

export type TabType = 'pending' | 'paid' | 'suppliers' | 'settings'

interface TabsNavigationProps {
  pendingCount?: number
}

const tabIds: { id: TabType; icon: React.ElementType }[] = [
  { id: 'pending', icon: FiClock },
  { id: 'paid', icon: FiCheckCircle },
  { id: 'suppliers', icon: FiUsers },
  { id: 'settings', icon: FiSettings },
]

export function TabsNavigation({ pendingCount = 0 }: TabsNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'pending'
  const t = useTranslations('backoffice')

  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabIds.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-1 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(`tabs.${tab.id}`)}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
