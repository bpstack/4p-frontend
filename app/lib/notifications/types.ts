// app/lib/notifications/types.ts

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationModule = 'groups' | 'parking' | 'logbooks' | 'system'
export type NotificationRelatedTo =
  | 'payment'
  | 'rooming'
  | 'balance'
  | 'contract'
  | 'arrival'
  | 'general'

export interface Notification {
  id: number
  module: NotificationModule
  group_id: number | null
  related_to: NotificationRelatedTo
  related_id: number | null
  direct_link: string | null
  title: string
  message: string | null
  priority: NotificationPriority
  is_read: boolean
  read_at: string | null
  group_name?: string
  created_at: string
  updated_at: string
}

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'border-gray-300 dark:border-gray-600',
  medium: 'border-blue-400 dark:border-blue-600',
  high: 'border-yellow-400 dark:border-yellow-600',
  urgent: 'border-red-500 dark:border-red-600',
}
