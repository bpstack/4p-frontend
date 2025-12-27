// app/stores/useMaintenanceStore.ts

import { create } from 'zustand'
import type {
  MaintenanceImage,
  MaintenanceHistory,
  ReportWithDetails,
  ReportFilters,
} from '@/app/lib/maintenance/maintenance'
import { maintenanceApi } from '@/app/lib/maintenance/maintenanceApi'

interface MaintenanceState {
  // Current report
  currentReport: ReportWithDetails | null
  setCurrentReport: (report: ReportWithDetails) => void

  // Images
  images: MaintenanceImage[]
  setImages: (images: MaintenanceImage[]) => void
  addImage: (image: MaintenanceImage) => void
  removeImage: (imageId: number) => void

  // History
  history: MaintenanceHistory[]
  setHistory: (history: MaintenanceHistory[]) => void
  addHistoryEntry: (entry: MaintenanceHistory) => void

  // Filters
  filters: ReportFilters
  setFilters: (filters: ReportFilters) => void

  // Loading states
  isLoadingReport: boolean
  isLoadingImages: boolean
  isLoadingHistory: boolean
  setIsLoadingReport: (loading: boolean) => void
  setIsLoadingImages: (loading: boolean) => void
  setIsLoadingHistory: (loading: boolean) => void

  // Actions
  refreshReport: (reportId: string) => Promise<void>
  refreshImages: (reportId: string) => Promise<void>
  refreshHistory: (reportId: string) => Promise<void>

  // Active tab
  activeTab: string
  setActiveTab: (tab: string) => void

  // Highlight
  highlightId: number | null
  setHighlight: (id: number | null) => void
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  // Initial state
  currentReport: null,
  images: [],
  history: [],
  filters: {},
  isLoadingReport: false,
  isLoadingImages: false,
  isLoadingHistory: false,
  activeTab: 'detail',
  highlightId: null,

  // Setters
  setCurrentReport: (report) => {
    set({
      currentReport: report,
      images: report.images || [],
      history: report.history || [],
    })
  },

  setImages: (images) => set({ images }),

  addImage: (image) =>
    set((state) => ({
      images: [...state.images, image],
    })),

  removeImage: (imageId) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== imageId),
    })),

  setHistory: (history) => set({ history }),

  addHistoryEntry: (entry) =>
    set((state) => ({
      history: [entry, ...state.history],
    })),

  setFilters: (filters) => set({ filters }),

  setIsLoadingReport: (loading) => set({ isLoadingReport: loading }),
  setIsLoadingImages: (loading) => set({ isLoadingImages: loading }),
  setIsLoadingHistory: (loading) => set({ isLoadingHistory: loading }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setHighlight: (id) => set({ highlightId: id }),

  // Refresh actions usando API real
  refreshReport: async (reportId: string) => {
    set({ isLoadingReport: true })
    try {
      const response = await maintenanceApi.getById(reportId)
      set({
        currentReport: response.report,
        images: response.report.images || [],
        history: response.report.history || [],
      })
    } catch (error) {
      console.error('Error refreshing report:', error)
    } finally {
      set({ isLoadingReport: false })
    }
  },

  refreshImages: async (reportId: string) => {
    set({ isLoadingImages: true })
    try {
      const response = await maintenanceApi.getById(reportId)
      set({ images: response.report.images || [] })
    } catch (error) {
      console.error('Error refreshing images:', error)
    } finally {
      set({ isLoadingImages: false })
    }
  },

  refreshHistory: async (reportId: string) => {
    set({ isLoadingHistory: true })
    try {
      const response = await maintenanceApi.getById(reportId)
      set({ history: response.report.history || [] })
    } catch (error) {
      console.error('Error refreshing history:', error)
    } finally {
      set({ isLoadingHistory: false })
    }
  },
}))
