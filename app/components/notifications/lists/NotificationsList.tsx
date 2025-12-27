// app/components/notifications/lists/NotificationsList.tsx

'use client'

import { useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { useNotifications } from '@/app/lib/notifications/useNotifications'
import NotificationItem from '../items/NotificationItem'
import { useTranslations } from 'next-intl'

type FilterType = 'all' | 'unread'

export default function NotificationsList() {
  const t = useTranslations('notifications')
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications()
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#21262d] dark:text-gray-300 dark:hover:bg-[#30363d]'
          }`}
        >
          {t('list.all', { count: notifications.length })}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#21262d] dark:text-gray-300 dark:hover:bg-[#30363d]'
          }`}
        >
          {t('list.unread', { count: unreadCount })}
        </button>
      </div>

      {/* List */}
      <div className="bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filter === 'unread' ? t('list.noUnread') : t('list.noNotifications')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#30363d]">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
