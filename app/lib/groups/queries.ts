// app/lib/groups/queries.ts
// ✅ USA apiClient con auto-refresh automático

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  Group,
  GroupWithDetails,
  GroupPayment,
  GroupContact,
  GroupRoom,
  GroupStatusRecord,
  GroupTimeline,
  GroupNotification,
  PaymentBalance,
  PaymentWithGroupInfo,
  DashboardOverview,
  GroupFilters,
  CreateGroupDTO,
  UpdateGroupDTO,
  CreateGroupPaymentDTO,
  UpdateGroupPaymentDTO,
  UpdateBookingDTO,
  UpdateContractDTO,
  UpdateRoomingDTO,
  UpdateBalanceDTO,
  CreateGroupContactDTO,
  UpdateGroupContactDTO,
  CreateGroupRoomDTO,
  UpdateGroupRoomDTO,
  CreateNotificationDTO,
  PaymentStatus,
  GroupHistoryRecord,
} from './types'

const API_URL = API_BASE_URL

// =============== GROUPS API ===============

export const groupsApi = {
  // ========== GRUPOS ==========

  /**
   * Obtiene todos los grupos con filtros opcionales
   */
  getAll: async (
    filters?: GroupFilters
  ): Promise<{ success: boolean; data: Group[]; count: number }> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    const url = `${API_URL}/api/groups${params.toString() ? `?${params.toString()}` : ''}`
    return apiClient.get(url)
  },

  /**
   * Obtiene un grupo por ID con detalles completos
   */
  getById: async (id: number): Promise<{ success: boolean; data: GroupWithDetails }> => {
    return apiClient.get(`${API_URL}/api/groups/${id}`)
  },

  /**
   * Crea un nuevo grupo
   */
  create: async (
    data: CreateGroupDTO
  ): Promise<{ success: boolean; message: string; data: Group }> => {
    return apiClient.post(`${API_URL}/api/groups`, data)
  },

  /**
   * Actualiza un grupo existente
   */
  update: async (
    id: number,
    data: UpdateGroupDTO
  ): Promise<{ success: boolean; message: string; data: Group }> => {
    return apiClient.put(`${API_URL}/api/groups/${id}`, data)
  },

  /**
   * Elimina un grupo
   */
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/groups/${id}`)
  },

  // ========== DASHBOARD ==========

  /**
   * Obtiene resumen del dashboard
   */
  getDashboardOverview: async (): Promise<{ success: boolean; data: DashboardOverview }> => {
    return apiClient.get(`${API_URL}/api/groups/dashboard/overview`)
  },

  /**
   * Obtiene timeline de grupos por mes
   */
  getDashboardTimeline: async (
    year?: number
  ): Promise<{ success: boolean; data: GroupTimeline[] }> => {
    const url = year
      ? `${API_URL}/api/groups/dashboard/timeline?year=${year}`
      : `${API_URL}/api/groups/dashboard/timeline`
    return apiClient.get(url)
  },

  // ========== PAGOS ==========

  /**
   * Obtiene todos los pagos de un grupo
   */
  getPayments: async (
    groupId: number
  ): Promise<{ success: boolean; data: { payments: GroupPayment[]; balance: PaymentBalance } }> => {
    return apiClient.get(`${API_URL}/api/groups/${groupId}/payments`)
  },

  /**
   * Crea un nuevo pago para un grupo
   */
  createPayment: async (
    groupId: number,
    data: CreateGroupPaymentDTO
  ): Promise<{ success: boolean; message: string; data: GroupPayment }> => {
    return apiClient.post(`${API_URL}/api/groups/${groupId}/payments`, data)
  },

  /**
   * Actualiza un pago completo
   */
  updatePayment: async (
    groupId: number,
    paymentId: number,
    data: UpdateGroupPaymentDTO
  ): Promise<{ success: boolean; message: string; data: GroupPayment }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/payments/${paymentId}`, data)
  },

  /**
   * Actualiza solo el estado de un pago
   */
  updatePaymentStatus: async (
    groupId: number,
    paymentId: number,
    status: PaymentStatus
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch(`${API_URL}/api/groups/${groupId}/payments/${paymentId}/status`, {
      status,
    })
  },

  /**
   * Registra pago parcial o total
   */
  updateAmountPaid: async (
    groupId: number,
    paymentId: number,
    amount_paid: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch(`${API_URL}/api/groups/${groupId}/payments/${paymentId}/amount-paid`, {
      amount_paid,
    })
  },

  /**
   * Elimina un pago
   */
  deletePayment: async (
    groupId: number,
    paymentId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/groups/${groupId}/payments/${paymentId}`)
  },

  /**
   * Obtiene pagos próximos a vencer
   */
  getUpcomingPayments: async (
    days: number = 7
  ): Promise<{ success: boolean; data: PaymentWithGroupInfo[]; count: number; days: number }> => {
    return apiClient.get(`${API_URL}/api/groups/payments/upcoming?days=${days}`)
  },

  /**
   * Obtiene pagos vencidos
   */
  getOverduePayments: async (): Promise<{
    success: boolean
    data: PaymentWithGroupInfo[]
    count: number
  }> => {
    return apiClient.get(`${API_URL}/api/groups/payments/overdue`)
  },

  // ========== ESTADOS ==========

  /**
   * Obtiene el estado completo de un grupo
   */
  getStatus: async (groupId: number): Promise<{ success: boolean; data: GroupStatusRecord }> => {
    return apiClient.get(`${API_URL}/api/groups/${groupId}/status`)
  },

  /**
   * Actualiza booking/confirmación
   */
  updateBooking: async (
    groupId: number,
    data: UpdateBookingDTO
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/status/booking`, data)
  },

  /**
   * Actualiza contrato
   */
  updateContract: async (
    groupId: number,
    data: UpdateContractDTO
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/status/contract`, data)
  },

  /**
   * Actualiza rooming list
   */
  updateRooming: async (
    groupId: number,
    data: UpdateRoomingDTO
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/status/rooming`, data)
  },

  /**
   * Actualiza balance
   */
  updateBalance: async (
    groupId: number,
    data: UpdateBalanceDTO
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/status/balance`, data)
  },

  // ========== HABITACIONES ==========

  getRooms: async (
    groupId: number
  ): Promise<{
    success: boolean
    data: { rooms: GroupRoom[]; summary?: Record<string, unknown> }
  }> => {
    return apiClient.get(`${API_URL}/api/groups/${groupId}/rooms`)
  },

  /**
   * Crea/actualiza habitaciones (UPSERT)
   */
  createOrUpdateRoom: async (
    groupId: number,
    data: CreateGroupRoomDTO
  ): Promise<{ success: boolean; message: string; data: GroupRoom }> => {
    return apiClient.post(`${API_URL}/api/groups/${groupId}/rooms`, data)
  },

  /**
   * Actualiza una habitación específica
   */
  updateRoom: async (
    groupId: number,
    roomId: number,
    data: UpdateGroupRoomDTO
  ): Promise<{ success: boolean; message: string; data: GroupRoom }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/rooms/${roomId}`, data)
  },

  /**
   * Elimina una habitación
   */
  deleteRoom: async (
    groupId: number,
    roomId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/groups/${groupId}/rooms/${roomId}`)
  },

  // ========== CONTACTOS ==========

  /**
   * Obtiene todos los contactos de un grupo
   */
  getContacts: async (groupId: number): Promise<{ success: boolean; data: GroupContact[] }> => {
    return apiClient.get(`${API_URL}/api/groups/${groupId}/contacts`)
  },

  /**
   * Obtiene el contacto principal
   */
  getPrimaryContact: async (
    groupId: number
  ): Promise<{ success: boolean; data: GroupContact | null }> => {
    return apiClient.get(`${API_URL}/api/groups/${groupId}/contacts/primary`)
  },

  /**
   * Crea un nuevo contacto
   */
  createContact: async (
    groupId: number,
    data: CreateGroupContactDTO
  ): Promise<{ success: boolean; message: string; data: GroupContact }> => {
    return apiClient.post(`${API_URL}/api/groups/${groupId}/contacts`, data)
  },

  /**
   * Actualiza un contacto
   */
  updateContact: async (
    groupId: number,
    contactId: number,
    data: UpdateGroupContactDTO
  ): Promise<{ success: boolean; message: string; data: GroupContact }> => {
    return apiClient.put(`${API_URL}/api/groups/${groupId}/contacts/${contactId}`, data)
  },

  /**
   * Elimina un contacto
   */
  deleteContact: async (
    groupId: number,
    contactId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/groups/${groupId}/contacts/${contactId}`)
  },

  // ========== HISTORIAL ==========

  /**
   * Obtiene historial completo de un grupo
   */
  getHistory: async (
    groupId: number,
    limit?: number
  ): Promise<{ success: boolean; data: GroupHistoryRecord[] }> => {
    const url = limit
      ? `${API_URL}/api/groups/${groupId}/history?limit=${limit}`
      : `${API_URL}/api/groups/${groupId}/history`
    return apiClient.get(url)
  },

  // ========== NOTIFICACIONES ==========

  /**
   * Crea una notificación para un grupo
   */
  createNotification: async (
    groupId: number,
    data: CreateNotificationDTO
  ): Promise<{ success: boolean; message: string; data: GroupNotification }> => {
    return apiClient.post(`${API_URL}/api/groups/${groupId}/notifications`, data)
  },

  /**
   * Obtiene notificaciones de un grupo
   */
  getNotifications: async (
    groupId: number
  ): Promise<{ success: boolean; data: GroupNotification[] }> => {
    return apiClient.get(`${API_URL}/api/groups/${groupId}/notifications`)
  },
}

// =============== NOTIFICATIONS API ===============

export const notificationsApi = {
  /**
   * Verifica y procesa notificaciones pendientes manualmente
   */
  checkPending: async (): Promise<{
    success: boolean
    message: string
    data?: {
      checked: number
      sent: number
      failed: number
    }
  }> => {
    return apiClient.post(`${API_URL}/api/notifications/check-pending`)
  },
}

export const groupsKeys = {
  list: (filters?: GroupFilters) => ['groups', 'list', filters ?? {}] as const,
  detail: (id: number) => ['groups', id] as const,
  payments: (id: number) => ['groups', id, 'payments'] as const,
  contacts: (id: number) => ['groups', id, 'contacts'] as const,
  rooms: (id: number) => ['groups', id, 'rooms'] as const,
  status: (id: number) => ['groups', id, 'status'] as const,
  dashboardOverview: () => ['groups', 'dashboard', 'overview'] as const,
  dashboardTimeline: (year?: number) => ['groups', 'dashboard', 'timeline', year ?? 'all'] as const,
  upcomingPayments: (days: number) => ['groups', 'payments', 'upcoming', days] as const,
  overduePayments: () => ['groups', 'payments', 'overdue'] as const,
  notifications: (id: number) => ['groups', id, 'notifications'] as const,
}

const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 0,
}

export const useGroups = (filters?: GroupFilters) => {
  return useQuery({
    queryKey: groupsKeys.list(filters),
    queryFn: () => groupsApi.getAll(filters),
    select: (res) => res.data,
    ...defaultQueryOptions,
  })
}

export const useGroup = (id?: number) => {
  return useQuery({
    queryKey: id ? groupsKeys.detail(id) : ['groups', 'detail', 'none'],
    queryFn: () => groupsApi.getById(id as number),
    select: (res) => res.data,
    enabled: typeof id === 'number' && !Number.isNaN(id),
    ...defaultQueryOptions,
  })
}

export const useGroupPayments = (id?: number) => {
  return useQuery({
    queryKey: id ? groupsKeys.payments(id) : ['groups', 'payments', 'none'],
    queryFn: () => groupsApi.getPayments(id as number),
    select: (res) => res.data,
    enabled: typeof id === 'number' && !Number.isNaN(id),
    ...defaultQueryOptions,
  })
}

export const useGroupContacts = (id?: number) => {
  return useQuery({
    queryKey: id ? groupsKeys.contacts(id) : ['groups', 'contacts', 'none'],
    queryFn: () => groupsApi.getContacts(id as number),
    select: (res) => res.data,
    enabled: typeof id === 'number' && !Number.isNaN(id),
    ...defaultQueryOptions,
  })
}

export const useGroupRooms = (id?: number) => {
  return useQuery({
    queryKey: id ? groupsKeys.rooms(id) : ['groups', 'rooms', 'none'],
    queryFn: () => groupsApi.getRooms(id as number),
    select: (res) => res.data.rooms || [],
    enabled: typeof id === 'number' && !Number.isNaN(id),
    ...defaultQueryOptions,
  })
}

export const useGroupStatus = (id?: number) => {
  return useQuery({
    queryKey: id ? groupsKeys.status(id) : ['groups', 'status', 'none'],
    queryFn: () => groupsApi.getStatus(id as number),
    select: (res) => res.data || res,
    enabled: typeof id === 'number' && !Number.isNaN(id),
    ...defaultQueryOptions,
  })
}

export const useGroupsDashboardOverview = () => {
  return useQuery({
    queryKey: groupsKeys.dashboardOverview(),
    queryFn: () => groupsApi.getDashboardOverview(),
    select: (res) => res.data,
    ...defaultQueryOptions,
  })
}

export const useGroupsDashboardTimeline = (year?: number) => {
  return useQuery({
    queryKey: groupsKeys.dashboardTimeline(year),
    queryFn: () => groupsApi.getDashboardTimeline(year),
    select: (res) => res.data,
    ...defaultQueryOptions,
  })
}

export const useUpcomingPayments = (days: number = 7) => {
  return useQuery({
    queryKey: groupsKeys.upcomingPayments(days),
    queryFn: () => groupsApi.getUpcomingPayments(days),
    select: (res) => res.data,
    ...defaultQueryOptions,
  })
}

export const useOverduePayments = () => {
  return useQuery({
    queryKey: groupsKeys.overduePayments(),
    queryFn: () => groupsApi.getOverduePayments(),
    select: (res) => res.data,
    ...defaultQueryOptions,
  })
}

export const useGroupNotifications = (id?: number) => {
  return useQuery({
    queryKey: id ? groupsKeys.notifications(id) : ['groups', 'notifications', 'none'],
    queryFn: () => groupsApi.getNotifications(id as number),
    select: (res) => res.data,
    enabled: typeof id === 'number' && !Number.isNaN(id),
    ...defaultQueryOptions,
  })
}

// ========================================
// MUTATIONS
// ========================================

export const useCreateGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupDTO) => groupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.list() })
      queryClient.invalidateQueries({ queryKey: groupsKeys.dashboardOverview() })
      queryClient.invalidateQueries({ queryKey: groupsKeys.dashboardTimeline() })
    },
  })
}

export const useUpdateGroup = (id?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGroupDTO) => groupsApi.update(id as number, data),
    onSuccess: () => {
      if (typeof id === 'number') {
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.dashboardOverview() })
        queryClient.invalidateQueries({ queryKey: groupsKeys.dashboardTimeline() })
      }
      queryClient.invalidateQueries({ queryKey: groupsKeys.list() })
    },
    meta: { entity: 'group', action: 'update', id },
  })
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => groupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.list() })
      queryClient.invalidateQueries({ queryKey: groupsKeys.dashboardOverview() })
      queryClient.invalidateQueries({ queryKey: groupsKeys.dashboardTimeline() })
    },
  })
}

// Payments
export const useCreatePayment = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupPaymentDTO) => groupsApi.createPayment(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.payments(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
      }
    },
  })
}

export const useUpdatePayment = (groupId?: number, paymentId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGroupPaymentDTO) =>
      groupsApi.updatePayment(groupId as number, paymentId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.payments(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
      }
    },
  })
}

export const useUpdatePaymentStatus = (groupId?: number, paymentId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: PaymentStatus) =>
      groupsApi.updatePaymentStatus(groupId as number, paymentId as number, status),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.payments(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
      }
    },
  })
}

export const useUpdateAmountPaid = (groupId?: number, paymentId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount_paid: number) =>
      groupsApi.updateAmountPaid(groupId as number, paymentId as number, amount_paid),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.payments(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
      }
    },
  })
}

export const useDeletePayment = (groupId?: number, paymentId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => groupsApi.deletePayment(groupId as number, paymentId as number),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.payments(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
      }
    },
  })
}

// Contacts
export const useCreateContact = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupContactDTO) => groupsApi.createContact(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.contacts(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useUpdateContact = (groupId?: number, contactId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGroupContactDTO) =>
      groupsApi.updateContact(groupId as number, contactId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.contacts(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useDeleteContact = (groupId?: number, contactId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => groupsApi.deleteContact(groupId as number, contactId as number),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.contacts(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

// Rooms
export const useCreateOrUpdateRoom = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupRoomDTO) => groupsApi.createOrUpdateRoom(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.rooms(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useUpdateRoom = (groupId?: number, roomId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGroupRoomDTO) =>
      groupsApi.updateRoom(groupId as number, roomId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.rooms(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useDeleteRoom = (groupId?: number, roomId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => groupsApi.deleteRoom(groupId as number, roomId as number),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.rooms(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

// Status updates
export const useUpdateBooking = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateBookingDTO) => groupsApi.updateBooking(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useUpdateContract = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateContractDTO) => groupsApi.updateContract(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useUpdateRooming = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateRoomingDTO) => groupsApi.updateRooming(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

export const useUpdateBalance = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateBalanceDTO) => groupsApi.updateBalance(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.status(groupId) })
        queryClient.invalidateQueries({ queryKey: groupsKeys.detail(groupId) })
      }
    },
  })
}

// Notifications
export const useCreateGroupNotification = (groupId?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNotificationDTO) =>
      groupsApi.createNotification(groupId as number, data),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupsKeys.notifications(groupId) })
      }
    },
  })
}
