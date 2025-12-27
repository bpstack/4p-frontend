// app/components/booking/BookingWizard/types.ts

import type { ParkingBooking } from '@/app/lib/parking/types'

/** Wizard display variant: 'full' for full page, 'modal' for CenterModal */
export type WizardVariant = 'full' | 'modal'

export interface ParkingSpotDisplay {
  id: number
  level_code: string
  spot_number: number
  spot_type: string
  status: 'free' | 'reserved' | 'checked_in'
  booking?: ParkingBooking
}

export interface VehicleData {
  plate_number: string
  owner_name: string
  model: string
}

export interface VehicleSearchResult {
  id: number
  plate_number: string
  owner_name: string
  model?: string
}

export interface ReservationData {
  spot_number: string
  level_code: string
  expected_checkin_date: string
  expected_checkin_time: string
  expected_checkout_date: string
  expected_checkout_time: string
  total_amount: string
  booking_source: string
  external_booking_id: string
  notes: string
}

export interface BookingWizardProps {
  variant?: WizardVariant
  preSelectedSpot?: ParkingSpotDisplay
  selectedDate?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export interface BookingWizardState {
  // Control de flujo
  step: number
  loading: boolean
  error: string
  success: boolean

  // Datos del vehículo
  vehicleData: VehicleData
  vehicleId: number | null
  searchingVehicles: boolean
  vehicleSearchResults: VehicleSearchResult[]
  showVehicleSearch: boolean

  // Datos de plaza
  availableSpots: ParkingSpotDisplay[]
  selectedSpot: ParkingSpotDisplay | null

  // Datos de reserva
  reservationData: ReservationData

  // Control de calendarios
  showCheckinCalendar: boolean
  showCheckoutCalendar: boolean
}

export interface BookingWizardActions {
  // Navegación
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Vehículo
  setVehicleData: (data: Partial<VehicleData>) => void
  handleSearchVehicles: (searchTerm: string) => Promise<void>
  handleSelectExistingVehicle: (vehicle: VehicleSearchResult) => void
  handleCreateVehicle: () => Promise<void>

  // Plaza y disponibilidad
  handleLoadAvailability: () => Promise<void>
  handleSelectSpot: (spot: ParkingSpotDisplay) => void

  // Reserva
  setReservationData: (data: Partial<ReservationData>) => void
  handleCreateReservation: () => Promise<void>
  calculateDays: () => number
  validateDates: () => boolean

  // UI
  setShowCheckinCalendar: (show: boolean) => void
  setShowCheckoutCalendar: (show: boolean) => void
  setError: (error: string) => void
  clearError: () => void
}
