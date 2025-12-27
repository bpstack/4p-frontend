// app/lib/parking/types.ts

// ========== TIPOS BASE DEL BACKEND ==========
export interface ParkingSpot {
  id: number
  level_code: string
  spot_number: number
  spot_type: 'normal' | 'ancha' | 'mas_ancha' | 'esquina' | 'accesible' | 'estrecha_bicis'
  is_active: boolean
  notes?: string
}

export interface ParkingVehicle {
  id: number
  plate_number: string
  owner_name: string
  model?: string
  created_at?: string
}

export interface ParkingBooking {
  id: number
  booking_code: string
  spot: {
    id: number
    number: number
    level: string
    type: string
  }
  vehicle: {
    id: number
    plate: string
    owner: string
    model?: string
  } | null
  operator: {
    id: string
    username: string
  } | null
  schedule: {
    expected_checkin: string
    expected_checkout: string
    actual_checkin?: string
    actual_checkout?: string
    planned_days: number
    actual_days?: number
  }
  status: 'reserved' | 'checked_in' | 'completed' | 'canceled' | 'no_show'
  payment: {
    total_amount: number
    paid_amount: number
    pending_amount: number
    method?: string
    reference?: string
    date?: string
  }
  booking_info: {
    source: string
    external_id?: string
  }
  notes?: string
  timestamps: {
    created_at: string
    updated_at: string
    created_by?: {
      id: string
      username: string
    }
    updated_by?: {
      id: string
      username: string
    }
  }
}

// ========== TIPOS PARA DASHBOARD/ESTADÍSTICAS ==========
export interface Stats {
  total_spots: number
  occupied_spots: number
  available_spots: number
  total_bookings: number
  pending_checkins: number
  pending_checkouts: number
  active_bookings: number
  completed_today: number
  canceled_today: number
  no_shows_today: number
  occupancy_rate: number
}

export interface OccupancyLevel {
  level: string
  total_spots: number
  occupied_spots: number
  available_spots: number
  total_bookings?: number
  max_occupied?: number
  min_occupied?: number
  occupancy_rate: number
}

export interface PendingCheckin {
  booking_id: number
  booking_code?: string
  spot: {
    number: number
    level: string
    type: string
    currently_occupied: boolean
  }
  vehicle: {
    plate: string
    owner: string
    model?: string
  } | null
  schedule: {
    expected_checkin: string
    expected_checkout: string
    days: number
  }
  booking_info: {
    source: string
    external_id?: string
    total_amount: number
    notes?: string
  }
}

export interface PendingCheckout {
  booking_id: number
  booking_code?: string
  spot: {
    number: number
    level: string
    type: string
  }
  vehicle: {
    plate: string
    owner: string
    model?: string
  } | null
  schedule: {
    expected_checkin: string
    actual_checkin?: string
    expected_checkout: string
    planned_days: number
    actual_days: number
    is_overdue: boolean
  }
  payment: {
    total_amount: number
    paid_amount: number
    pending_amount: number
    method?: string
  }
  booking_info: {
    source: string
    external_id?: string
    notes?: string
  }
}

export interface AvailableSpot {
  id: number
  level_code: string
  spot_number: number
  spot_type: string
  dias_disponibles?: number
  dias_requeridos?: number
}

export interface OverdueBooking {
  id: number
  booking_code: string
  spot: {
    number: number
    level: string
    type: string
  }
  vehicle: {
    plate: string
    owner: string
    model?: string
  } | null
  actual_checkin: string
  expected_checkout: string
  horas_retraso: number
  status: 'checked_in'
  notes?: string
  timestamps: {
    created_at: string
    updated_at: string
  }
}

// ========== TIPOS PARA STATUS/DISPLAY ==========
export interface SpotTypeStats {
  total: number
  available: number
  reserved: number
  occupied: number
}

export interface LevelData {
  level: string
  total_spots: number
  available_spots: number
  reserved_spots: number
  occupied_spots: number
  by_type: {
    [key: string]: SpotTypeStats
  }
  occupancy_rate: number
}

export interface AvailabilityData {
  date: string
  levels: LevelData[]
  summary: {
    level: string
    total_spots: number
    available_spots: number
    reserved_spots: number
    occupied_spots: number
    occupancy_rate: number
  }
}

export interface ParkingSpotDisplay {
  id: number
  level_code: string
  spot_number: number
  spot_type: string
  status: 'free' | 'reserved' | 'checked_in'
  booking?: ParkingBooking
}

// ========== RESPONSE TYPES ==========
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface OverdueBookingsResponse {
  success: boolean
  total: number
  bookings: OverdueBooking[]
}

export interface BookingsResponse {
  success: boolean
  total: number
  pagination?: PaginationInfo
  bookings: ParkingBooking[]
}

export interface BookingResponse {
  success: boolean
  message: string
  booking: ParkingBooking
}

export interface StatsResponse {
  success: boolean
  date: string
  stats: Stats
}

export interface OccupancyResponse {
  success: boolean
  date: string
  data: {
    levels: OccupancyLevel[]
    summary: OccupancyLevel
  }
}

export interface PendingCheckinsResponse {
  success: boolean
  date: string
  total: number
  checkins: PendingCheckin[]
}

export interface PendingCheckoutsResponse {
  success: boolean
  date: string
  total: number
  checkouts: PendingCheckout[]
}

export interface FullStatsResponse {
  success: boolean
  period: {
    type: string
    date?: string
    startDate?: string
    endDate?: string
    days?: number
  }
  dashboard: {
    stats: Stats
    occupancy: {
      levels: OccupancyLevel[]
      summary: OccupancyLevel
    }
    pending_checkins: {
      total: number
      items: PendingCheckin[]
    } | null
    pending_checkouts: {
      total: number
      items: PendingCheckout[]
    } | null
    availability: Record<string, unknown> | null
    note?: string
  }
}

// ========== DTOs ==========
export interface CreateBookingDto {
  spot_number: number
  level_code: string
  vehicle_id?: number
  expected_checkin: string
  expected_checkout: string
  total_amount?: number
  source?: string
  external_id?: string
  notes?: string
}

export interface UpdateBookingDto {
  expected_checkin?: string
  expected_checkout?: string
  spot_number?: number
  level_code?: string
  vehicle_id?: number
  total_amount?: number
  booking_source?: string
  notes?: string
  // Payment fields - can be updated at any time
  payment_amount?: number | null
  payment_method?: 'cash' | 'card' | 'transfer' | 'agency' | null
  payment_reference?: string | null
}

export interface CreateVehicleDto {
  plate_number: string
  owner_name: string
  model?: string
}

export interface CheckInDto {
  actual_checkin?: string
  notes?: string
}

export interface CheckOutDto {
  actual_checkout?: string
  payment_amount?: number
  payment_method?: string
  payment_reference?: string
  notes?: string
}
