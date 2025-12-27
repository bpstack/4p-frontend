// app/stores/useGroupStore.ts

import { create } from 'zustand'
import { groupsApi } from '@/app/lib/groups'
import type {
  GroupWithDetails,
  GroupPayment,
  GroupContact,
  GroupRoom,
  GroupStatusRecord,
} from '@/app/lib/groups'

interface GroupStore {
  // ========================================
  // DATA (viene de API)
  // ========================================
  currentGroup: GroupWithDetails | null
  payments: GroupPayment[]
  contacts: GroupContact[]
  rooms: GroupRoom[]
  status: GroupStatusRecord | null

  // ========================================
  // UI STATE
  // ========================================
  activeTab: string
  activePanelId: string | null // 'new', 'edit-5', null
  highlightId: number | null

  // ========================================
  // LOADING STATES
  // ========================================
  isLoadingGroup: boolean
  isLoadingPayments: boolean
  isLoadingContacts: boolean
  isLoadingRooms: boolean
  isLoadingStatus: boolean

  // ========================================
  // ACTIONS - Data
  // ========================================
  setCurrentGroup: (group: GroupWithDetails | null) => void
  setPayments: (payments: GroupPayment[]) => void
  setContacts: (contacts: GroupContact[]) => void
  setRooms: (rooms: GroupRoom[]) => void
  setStatus: (status: GroupStatusRecord | null) => void

  refreshGroup: (groupId: number) => Promise<void>
  refreshPayments: (groupId: number) => Promise<void>
  refreshContacts: (groupId: number) => Promise<void>
  refreshRooms: (groupId: number) => Promise<void>
  refreshStatus: (groupId: number) => Promise<void>
  deletePayment: (groupId: number, paymentId: number) => Promise<void>

  // ========================================
  // ACTIONS - UI
  // ========================================
  setActiveTab: (tab: string) => void
  openPanel: (panelId: string) => void
  closePanel: () => void
  setHighlight: (id: number | null) => void

  // ========================================
  // ACTIONS - Reset
  // ========================================
  reset: () => void
}

const initialState = {
  currentGroup: null,
  payments: [],
  contacts: [],
  rooms: [],
  status: null,
  activeTab: 'overview',
  activePanelId: null,
  highlightId: null,
  isLoadingGroup: false,
  isLoadingPayments: false,
  isLoadingContacts: false,
  isLoadingRooms: false,
  isLoadingStatus: false,
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  ...initialState,

  // ========================================
  // SETTERS
  // ========================================
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setPayments: (payments) => set({ payments }),
  setContacts: (contacts) => set({ contacts }),
  setRooms: (rooms) => set({ rooms }),
  setStatus: (status) => set({ status }),

  // ========================================
  // REFRESH DATA FROM API
  // ========================================
  refreshGroup: async (groupId: number) => {
    set({ isLoadingGroup: true })
    try {
      const response = await groupsApi.getById(groupId)
      set({ currentGroup: response.data })
    } catch (error) {
      console.error('Error refreshing group:', error)
    } finally {
      set({ isLoadingGroup: false })
    }
  },

  refreshPayments: async (groupId: number) => {
    set({ isLoadingPayments: true })
    try {
      const response = await groupsApi.getPayments(groupId)
      set({ payments: response.data.payments })
    } catch (error) {
      console.error('Error refreshing payments:', error)
    } finally {
      set({ isLoadingPayments: false })
    }
  },

  refreshContacts: async (groupId: number) => {
    set({ isLoadingContacts: true })
    try {
      const response = await groupsApi.getContacts(groupId)
      set({ contacts: response.data })
    } catch (error) {
      console.error('Error refreshing contacts:', error)
    } finally {
      set({ isLoadingContacts: false })
    }
  },

  refreshRooms: async (groupId: number) => {
    set({ isLoadingRooms: true })
    try {
      const response = await groupsApi.getRooms(groupId)

      // Extraer solo el array de rooms
      set({ rooms: response.data.rooms || [] })
    } catch (error) {
      console.error('Error refreshing rooms:', error)
      set({ rooms: [] })
    } finally {
      set({ isLoadingRooms: false })
    }
  },

  refreshStatus: async (groupId: number) => {
    set({ isLoadingStatus: true })
    try {
      const response = await groupsApi.getStatus(groupId)

      // La API puede devolver el status en response.data o directamente en response
      const statusData = response.data || response
      set({ status: statusData })
    } catch (error) {
      console.error('Error refreshing status:', error)
      set({ status: null })
    } finally {
      set({ isLoadingStatus: false })
    }
  },

  // ========================================
  // DELETE PAYMENT
  // ========================================
  deletePayment: async (groupId: number, paymentId: number) => {
    try {
      await groupsApi.deletePayment(groupId, paymentId)
      await get().refreshPayments(groupId)
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  },

  // ========================================
  // UI ACTIONS
  // ========================================
  setActiveTab: (tab) => set({ activeTab: tab }),

  openPanel: (panelId) => set({ activePanelId: panelId }),

  closePanel: () => set({ activePanelId: null }),

  setHighlight: (id) => set({ highlightId: id }),

  // ========================================
  // RESET
  // ========================================
  reset: () => set(initialState),
}))
