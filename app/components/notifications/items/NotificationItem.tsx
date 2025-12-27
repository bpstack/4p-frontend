// app/components/notifications/items/NotificationItem.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FiCheck, FiTrash2 } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Notification, NotificationPriority } from '@/app/lib/notifications/types'
import { PRIORITY_COLORS } from '@/app/lib/notifications/types'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
  showActions?: boolean
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
}: NotificationItemProps) {
  const router = useRouter()
  const t = useTranslations('notifications')

  const relativeTime = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  })

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    if (notification.direct_link) {
      router.push(notification.direct_link)
    }
  }

  const priorityColor = PRIORITY_COLORS[notification.priority as NotificationPriority]

  return (
    <div
      className={`p-4 border-l-4 ${priorityColor} ${
        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button onClick={handleClick} className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            {!notification.is_read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </h3>
          </div>
          {notification.message && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {notification.group_name && (
              <>
                <span>{notification.group_name}</span>
                <span>•</span>
              </>
            )}
            <span>{relativeTime}</span>
          </div>
        </button>

        {showActions && (
          <div className="flex gap-1">
            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title={t('item.markAsRead')}
              >
                <FiCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title={t('item.delete')}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
