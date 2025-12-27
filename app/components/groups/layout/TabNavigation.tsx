// app/components/groups/layout/TabNavigation.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/app/lib/helpers/utils'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

type Tab = 'overview' | 'payments' | 'contacts' | 'rooms' | 'status' | 'history'

interface TabNavigationProps {
  groupId: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TabNavigation(_props: TabNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') || 'overview') as Tab
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('groups')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: t('tabs.overview') },
    { id: 'payments', label: t('tabs.payments') },
    { id: 'contacts', label: t('tabs.contacts') },
    { id: 'rooms', label: t('tabs.rooms') },
    { id: 'status', label: t('tabs.status') },
    { id: 'history', label: t('tabs.history') },
  ]

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0]

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    // Limpiar panel y highlight al cambiar tab
    params.delete('panel')
    params.delete('highlight')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setIsOpen(false)
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#010409]">
      {/* Mobile: Dropdown */}
      <div className="md:hidden px-4 py-2" ref={dropdownRef}>
        <div className="relative w-fit">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span>{activeTabConfig.label}</span>
            <FiChevronDown
              className={cn(
                'w-4 h-4 text-gray-500 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && <FiCheck className="w-4 h-4" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Tabs tradicionales */}
      <nav className="hidden md:flex max-w-[1400px] -mb-px space-x-4 px-4 md:px-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
