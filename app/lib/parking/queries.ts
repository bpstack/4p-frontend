// app/lib/parking/queries.ts

import apiClient from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  ParkingSpot,
  ParkingVehicle,
  ParkingBooking,
  AvailableSpot,
  CreateBookingDto,
  UpdateBookingDto,
  CreateVehicleDto,
  CheckInDto,
  CheckOutDto,
  BookingResponse,
  BookingsResponse,
  StatsResponse,
  OccupancyResponse,
  PendingCheckinsResponse,
  PendingCheckoutsResponse,
  FullStatsResponse,
  OverdueBookingsResponse,
} from '@/app/lib/parking/types'

// ❌ ELIMINAR TODAS LAS INTERFACES DE AQUÍ - Ya están en types.ts
// NO debe haber ningún "export interface" en este archivo

const API_URL = API_BASE_URL

export const parkingApi = {
  // ============================================
  // SPOTS (Plazas de parking)
  // ============================================

  /**
   * Obtiene todas las plazas de parking
   */
  getAllSpots: async (): Promise<ParkingSpot[]> => {
    return apiClient.get(`${API_URL}/api/parking/spots`)
  },

  /**
   * Obtiene plazas por nivel (-2, -3)
   */
  getSpotsByLevel: async (level: string): Promise<ParkingSpot[]> => {
    return apiClient.get(`${API_URL}/api/parking/spots?level=${level}`)
  },

  /**
   * Obtiene plazas por tipo (normal, ancha, etc.)
   */
  getSpotsByType: async (type: string): Promise<ParkingSpot[]> => {
    return apiClient.get(`${API_URL}/api/parking/spots?type=${type}`)
  },

  /**
   * Obtiene plazas disponibles para una fecha específica
   */
  getAvailableSpotsByDate: async (
    date: string
  ): Promise<{
    date: string
    total: number
    spots: AvailableSpot[]
  }> => {
    return apiClient.get(`${API_URL}/api/parking/spots/available?date=${date}`)
  },

  /**
   * Obtiene plazas disponibles en un rango de fechas
   */
  getAvailableSpotsByRange: async (params: {
    start_date: string
    end_date: string
    level?: string
  }): Promise<{
    start_date: string
    end_date: string
    days: number
    level: string
    total: number
    spots: AvailableSpot[]
  }> => {
    const query = new URLSearchParams({
      start_date: params.start_date,
      end_date: params.end_date,
      ...(params.level && { level: params.level }),
    })
    return apiClient.get(`${API_URL}/api/parking/spots/available?${query}`)
  },

  /**
   * Obtiene plazas disponibles para hoy
   */
  getAvailableSpotsToday: async (): Promise<{
    date: string
    total: number
    spots: AvailableSpot[]
  }> => {
    return apiClient.get(`${API_URL}/api/parking/spots/available`)
  },

  // ============================================
  // VEHICLES (Vehículos)
  // ============================================

  /**
   * Crea un nuevo vehículo
   */
  createVehicle: async (data: CreateVehicleDto): Promise<{ id: number; message?: string }> => {
    return apiClient.post(`${API_URL}/api/parking/vehicles`, data)
  },

  /**
   * Obtiene todos los vehículos registrados
   */
  getAllVehicles: async (): Promise<ParkingVehicle[]> => {
    return apiClient.get(`${API_URL}/api/parking/vehicles`)
  },
  /**
   * Busca vehículos por matrícula O propietario (parcial)
   */
  searchVehicles: async (searchTerm: string): Promise<ParkingVehicle[]> => {
    if (!searchTerm || searchTerm.length < 2) return []
    return apiClient.get(
      `${API_URL}/api/parking/vehicles/search?q=${encodeURIComponent(searchTerm)}`
    )
  },
  /**
   * Busca un vehículo por matrícula
   */
  getVehicleByPlate: async (plate: string): Promise<ParkingVehicle> => {
    return apiClient.get(`${API_URL}/api/parking/vehicles?plate_number=${plate}`)
  },

  /**
   * Busca vehículos por propietario
   */
  getVehiclesByOwner: async (owner: string): Promise<ParkingVehicle[]> => {
    return apiClient.get(`${API_URL}/api/parking/vehicles?owner_name=${owner}`)
  },

  // ============================================
  // BOOKINGS (Reservas)
  // ============================================

  /**
   * Crea una nueva reserva
   * ✅ RESPONSE incluye booking_code generado automáticamente
   */
  createBooking: async (data: CreateBookingDto): Promise<BookingResponse> => {
    return apiClient.post(`${API_URL}/api/parking/bookings`, data)
  },

  /**
   * Obtiene todas las reservas con filtros opcionales y paginación
   */
  getAllBookings: async (filters?: {
    status?: string
    date?: string
    plate_number?: string
    quickFilter?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<BookingsResponse> => {
    const query = new URLSearchParams()
    if (filters?.status) query.append('status', filters.status)
    if (filters?.date) query.append('date', filters.date)
    if (filters?.plate_number) query.append('plate_number', filters.plate_number)
    if (filters?.quickFilter) query.append('quickFilter', filters.quickFilter)
    if (filters?.startDate) query.append('startDate', filters.startDate)
    if (filters?.endDate) query.append('endDate', filters.endDate)
    if (filters?.page) query.append('page', String(filters.page))
    if (filters?.limit) query.append('limit', String(filters.limit))
    return apiClient.get(`${API_URL}/api/parking/bookings?${query}`)
  },

  /**
   * Obtiene una reserva por CÓDIGO (PK-YYYYMMDD-####)
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  getBookingByCode: async (
    code: string
  ): Promise<{ success: boolean; booking: ParkingBooking }> => {
    return apiClient.get(`${API_URL}/api/parking/bookings/${code}`)
  },

  /**
   * Actualiza una reserva existente
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  updateBooking: async (code: string, data: UpdateBookingDto): Promise<BookingResponse> => {
    return apiClient.put(`${API_URL}/api/parking/bookings/${code}`, data)
  },

  /**
   * Elimina una reserva
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  deleteBooking: async (
    code: string
  ): Promise<{ success: boolean; message: string; error?: string }> => {
    return apiClient.delete(`${API_URL}/api/parking/bookings/${code}`)
  },

  /**
   * Realiza el check-in de una reserva
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  checkInBooking: async (code: string, data?: CheckInDto): Promise<BookingResponse> => {
    return apiClient.put(`${API_URL}/api/parking/bookings/${code}/checkin`, data || {})
  },

  /**
   * Realiza el check-out de una reserva
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  checkOutBooking: async (code: string, data?: CheckOutDto): Promise<BookingResponse> => {
    return apiClient.put(`${API_URL}/api/parking/bookings/${code}/checkout`, data || {})
  },

  /**
   * Cancela una reserva
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  cancelBooking: async (code: string, notes?: string): Promise<BookingResponse> => {
    return apiClient.put(`${API_URL}/api/parking/bookings/${code}/cancel`, { notes })
  },

  /**
   * Marca una reserva como no-show
   * ✅ ACTUALIZADO: Ahora usa código en vez de ID
   */
  markBookingNoShow: async (code: string, notes?: string): Promise<BookingResponse> => {
    return apiClient.put(`${API_URL}/api/parking/bookings/${code}/no-show`, { notes })
  },

  // ============================================
  // STATS (Estadísticas para dashboard)
  // ============================================

  /**
   * Obtiene estadísticas generales del día
   * @param date - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   */
  getStats: async (date?: string): Promise<StatsResponse> => {
    const url = date ? `${API_URL}/api/parking/stats?date=${date}` : `${API_URL}/api/parking/stats`
    return apiClient.get(url)
  },

  /**
   * Obtiene ocupación por planta
   * @param date - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   */
  getOccupancy: async (date?: string): Promise<OccupancyResponse> => {
    const url = date
      ? `${API_URL}/api/parking/stats/occupancy?date=${date}`
      : `${API_URL}/api/parking/stats/occupancy`
    return apiClient.get(url)
  },

  /**
   * Obtiene check-ins pendientes
   * @param date - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   */
  getPendingCheckins: async (date?: string): Promise<PendingCheckinsResponse> => {
    const url = date
      ? `${API_URL}/api/parking/stats/pending-checkins?date=${date}`
      : `${API_URL}/api/parking/stats/pending-checkins`
    return apiClient.get(url)
  },

  /**
   * Obtiene check-outs pendientes
   * @param date - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   */
  getPendingCheckouts: async (date?: string): Promise<PendingCheckoutsResponse> => {
    const url = date
      ? `${API_URL}/api/parking/stats/pending-checkouts?date=${date}`
      : `${API_URL}/api/parking/stats/pending-checkouts`
    return apiClient.get(url)
  },

  /**
   * Obtiene TODAS las estadísticas de golpe (fecha única)
   * @param date - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   */
  getFullStats: async (date?: string): Promise<FullStatsResponse> => {
    const url = date ? `${API_URL}/api/parking/stats?date=${date}` : `${API_URL}/api/parking/stats`
    return apiClient.get(url)
  },

  /**
   * Obtiene estadísticas por rango de fechas
   * @param startDate - Fecha inicio (YYYY-MM-DD)
   * @param endDate - Fecha fin (YYYY-MM-DD)
   */
  getStatsByRange: async (startDate: string, endDate: string): Promise<FullStatsResponse> => {
    return apiClient.get(`${API_URL}/api/parking/stats?startDate=${startDate}&endDate=${endDate}`)
  },

  /**
   * Obtener reservas con check-out expirado
   * Retorna vehículos que deberían haber salido ya pero siguen en parking
   *
   * @returns {Promise<OverdueBookingsResponse>} Lista de reservas retrasadas
   */
  getOverdueBookings: async (): Promise<OverdueBookingsResponse> => {
    return apiClient.get(`${API_URL}/api/parking/bookings/overdue/list`)
  },
}
