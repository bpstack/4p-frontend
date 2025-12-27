// app/stores/useCashierStore.ts

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { formatDateForInput } from '@/app/lib/helpers/date'
import type { ShiftType, HistoryAction } from '@/app/lib/cashier/types'

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

type ModalType = 'initializeDay' | 'closeDay' | 'reopenDay' | 'closeShift' | null
type ReportsTab = 'summary' | 'payments' | 'vouchers'
type ChartViewMode = 'pie' | 'bar'

interface CashierStore {
  // ========================================
  // HOTEL - DATE STATE
  // ========================================
  selectedDate: string
  currentDate: Date
  selectedDay: number

  // ========================================
  // HOTEL - UI STATE
  // ========================================
  activeTab: ShiftType
  activeModal: ModalType
  modalData: Record<string, unknown> | null

  // ========================================
  // LOGS - STATE
  // ========================================
  logsDate: string
  logsActionFilter: HistoryAction | 'all'
  logsUserFilter: string
  logsLimit: number
  logsOffset: number

  // ========================================
  // REPORTS - STATE
  // ========================================
  reportsYear: number
  reportsMonth: number
  reportsTab: ReportsTab
  chartViewMode: ChartViewMode

  // ========================================
  // COMPUTED (derivado de currentDate)
  // ========================================
  getCurrentMonth: (locale?: string) => string
  getCurrentYear: () => number
  getLogsFormattedDate: (locale?: string) => string
  getReportsDisplayLabel: (locale?: string) => string

  // ========================================
  // HOTEL - DATE ACTIONS
  // ========================================
  setSelectedDate: (date: string) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
  selectDay: (day: number) => void

  // ========================================
  // HOTEL - UI ACTIONS
  // ========================================
  setActiveTab: (tab: ShiftType) => void
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void
  closeModal: () => void

  // ========================================
  // LOGS - ACTIONS
  // ========================================
  setLogsDate: (date: string) => void
  logsGoToPreviousDay: () => void
  logsGoToNextDay: () => void
  logsGoToToday: () => void
  setLogsActionFilter: (action: HistoryAction | 'all') => void
  setLogsUserFilter: (user: string) => void
  logsNextPage: () => void
  logsPreviousPage: () => void
  logsResetOffset: () => void

  // ========================================
  // REPORTS - ACTIONS
  // ========================================
  reportsGoToPreviousMonth: () => void
  reportsGoToNextMonth: () => void
  reportsGoToCurrentMonth: () => void
  setReportsTab: (tab: ReportsTab) => void
  setChartViewMode: (mode: ChartViewMode) => void

  // ========================================
  // RESET
  // ========================================
  reset: () => void
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Get localized month name using Intl.DateTimeFormat
 * Falls back to the provided locale or 'es-ES'
 */
function getLocalizedMonthName(month: number, locale: string = 'es-ES'): string {
  const date = new Date(2000, month - 1, 1) // month is 1-indexed
  return date.toLocaleString(locale, { month: 'long' })
}

// ═══════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════

const today = new Date()
const initialState = {
  // Hotel
  selectedDate: formatDateForInput(today),
  currentDate: today,
  selectedDay: today.getDate(),
  activeTab: 'night' as ShiftType,
  activeModal: null as ModalType,
  modalData: null,

  // Logs
  logsDate: today.toISOString().split('T')[0],
  logsActionFilter: 'all' as HistoryAction | 'all',
  logsUserFilter: '',
  logsLimit: 50,
  logsOffset: 0,

  // Reports
  reportsYear: today.getFullYear(),
  reportsMonth: today.getMonth() + 1, // 1-12
  reportsTab: 'summary' as ReportsTab,
  chartViewMode: 'pie' as ChartViewMode,
}

// ═══════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════

export const useCashierStore = create<CashierStore>((set, get) => ({
  ...initialState,

  // ========================================
  // COMPUTED
  // ========================================
  getCurrentMonth: (locale = 'es-ES') => {
    return get().currentDate.toLocaleString(locale, { month: 'long' })
  },

  getCurrentYear: () => {
    return get().currentDate.getFullYear()
  },

  getLogsFormattedDate: (locale = 'es-ES') => {
    return new Date(get().logsDate).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  },

  getReportsDisplayLabel: (locale = 'es-ES') => {
    const { reportsMonth, reportsYear } = get()
    const monthName = getLocalizedMonthName(reportsMonth, locale)
    // Capitalize first letter
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    return `${capitalizedMonth} ${reportsYear}`
  },

  // ========================================
  // HOTEL - DATE ACTIONS
  // ========================================
  setSelectedDate: (date) => set({ selectedDate: date }),

  goToPreviousMonth: () => {
    const { currentDate } = get()
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)

    const formattedDate = formatDateForInput(new Date(newDate.getFullYear(), newDate.getMonth(), 1))

    set({
      currentDate: newDate,
      selectedDay: 1,
      selectedDate: formattedDate,
    })
  },

  goToNextMonth: () => {
    const { currentDate } = get()
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)

    const formattedDate = formatDateForInput(new Date(newDate.getFullYear(), newDate.getMonth(), 1))

    set({
      currentDate: newDate,
      selectedDay: 1,
      selectedDate: formattedDate,
    })
  },

  goToToday: () => {
    const today = new Date()
    set({
      currentDate: today,
      selectedDay: today.getDate(),
      selectedDate: formatDateForInput(today),
    })
  },

  selectDay: (day) => {
    const { currentDate } = get()
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    set({
      selectedDay: day,
      selectedDate: formatDateForInput(newDate),
    })
  },

  // ========================================
  // HOTEL - UI ACTIONS
  // ========================================
  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (modal, data = {}) =>
    set({
      activeModal: modal,
      modalData: data,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalData: null,
    }),

  // ========================================
  // LOGS - ACTIONS
  // ========================================
  setLogsDate: (date) => set({ logsDate: date, logsOffset: 0 }),

  logsGoToPreviousDay: () => {
    const { logsDate } = get()
    const date = new Date(logsDate)
    date.setDate(date.getDate() - 1)
    set({
      logsDate: date.toISOString().split('T')[0],
      logsOffset: 0,
    })
  },

  logsGoToNextDay: () => {
    const { logsDate } = get()
    const date = new Date(logsDate)
    date.setDate(date.getDate() + 1)
    set({
      logsDate: date.toISOString().split('T')[0],
      logsOffset: 0,
    })
  },

  logsGoToToday: () => {
    set({
      logsDate: new Date().toISOString().split('T')[0],
      logsOffset: 0,
    })
  },

  setLogsActionFilter: (action) => set({ logsActionFilter: action, logsOffset: 0 }),

  setLogsUserFilter: (user) => set({ logsUserFilter: user, logsOffset: 0 }),

  logsNextPage: () => {
    const { logsOffset, logsLimit } = get()
    set({ logsOffset: logsOffset + logsLimit })
  },

  logsPreviousPage: () => {
    const { logsOffset, logsLimit } = get()
    set({ logsOffset: Math.max(0, logsOffset - logsLimit) })
  },

  logsResetOffset: () => set({ logsOffset: 0 }),

  // ========================================
  // REPORTS - ACTIONS
  // ========================================
  reportsGoToPreviousMonth: () => {
    const { reportsMonth, reportsYear } = get()
    if (reportsMonth === 1) {
      set({ reportsMonth: 12, reportsYear: reportsYear - 1 })
    } else {
      set({ reportsMonth: reportsMonth - 1 })
    }
  },

  reportsGoToNextMonth: () => {
    const { reportsMonth, reportsYear } = get()
    if (reportsMonth === 12) {
      set({ reportsMonth: 1, reportsYear: reportsYear + 1 })
    } else {
      set({ reportsMonth: reportsMonth + 1 })
    }
  },

  reportsGoToCurrentMonth: () => {
    const now = new Date()
    set({
      reportsYear: now.getFullYear(),
      reportsMonth: now.getMonth() + 1,
    })
  },

  setReportsTab: (tab) => set({ reportsTab: tab }),

  setChartViewMode: (mode) => set({ chartViewMode: mode }),

  // ========================================
  // RESET
  // ========================================
  reset: () => set(initialState),
}))

// ═══════════════════════════════════════════════════════
// SELECTOR HOOKS (para optimizar re-renders)
// ═══════════════════════════════════════════════════════

// Hotel selectors
export const useSelectedDate = () => useCashierStore((s) => s.selectedDate)
export const useActiveTab = () => useCashierStore((s) => s.activeTab)
export const useActiveModal = () => useCashierStore((s) => s.activeModal)
export const useIsModalOpen = (modal: ModalType) => useCashierStore((s) => s.activeModal === modal)

// Logs selectors
export const useLogsDate = () => useCashierStore((s) => s.logsDate)
export const useLogsFilters = () =>
  useCashierStore(
    useShallow((s) => ({
      actionFilter: s.logsActionFilter,
      userFilter: s.logsUserFilter,
      limit: s.logsLimit,
      offset: s.logsOffset,
    }))
  )

// Reports selectors
export const useReportsDate = () =>
  useCashierStore(
    useShallow((s) => ({
      year: s.reportsYear,
      month: s.reportsMonth,
    }))
  )
export const useReportsTab = () => useCashierStore((s) => s.reportsTab)
export const useChartViewMode = () => useCashierStore((s) => s.chartViewMode)
