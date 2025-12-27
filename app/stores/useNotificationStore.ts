// stores/useNotificationStore.ts
// Lightweight store for UI-only state (e.g., modal open/closed)
// Data fetching is handled by React Query (see lib/notifications/queries.ts)

import { create } from 'zustand'

// Re-export types for convenience
export type {
  Notification,
  NotificationPriority,
  NotificationModule,
  NotificationRelatedTo,
} from '@/app/lib/notifications/types'

interface NotificationUIStore {
  // UI state
  isDropdownOpen: boolean
  selectedNotificationId: number | null

  // Actions
  setDropdownOpen: (open: boolean) => void
  setSelectedNotification: (id: number | null) => void
  reset: () => void
}

export const useNotificationStore = create<NotificationUIStore>((set) => ({
  isDropdownOpen: false,
  selectedNotificationId: null,

  setDropdownOpen: (open) => set({ isDropdownOpen: open }),
  setSelectedNotification: (id) => set({ selectedNotificationId: id }),
  reset: () => set({ isDropdownOpen: false, selectedNotificationId: null }),
}))
