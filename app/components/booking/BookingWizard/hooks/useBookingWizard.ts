// app/components/booking/BookingWizard/hooks/useBookingWizard.ts

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { parkingApi } from '@/app/lib/parking'
import type {
  BookingWizardState,
  BookingWizardActions,
  VehicleData,
  VehicleSearchResult,
  ParkingSpotDisplay,
  ReservationData,
  BookingWizardProps,
} from '../types'
import type {
  ParkingSpot,
  ParkingVehicle,
  ParkingBooking,
  CreateBookingDto,
} from '@/app/lib/parking/types'
import { formatDateForInput } from '@/app/lib/helpers/date'

const initialVehicleData: VehicleData = {
  plate_number: '',
  owner_name: '',
  model: '',
}

const initialReservationData: ReservationData = {
  spot_number: '',
  level_code: '',
  expected_checkin_date: '',
  expected_checkin_time: '15:00',
  expected_checkout_date: '',
  expected_checkout_time: '15:00',
  total_amount: '',
  booking_source: 'direct',
  external_booking_id: '',
  notes: '',
}

export const useBookingWizard = ({
  variant = 'full',
  preSelectedSpot,
  selectedDate,
  onSuccess,
}: BookingWizardProps) => {
  // ============ ESTADO ============
  const [state, setState] = useState<BookingWizardState>({
    step: 1,
    loading: false,
    error: '',
    success: false,
    vehicleData: initialVehicleData,
    vehicleId: null,
    searchingVehicles: false,
    vehicleSearchResults: [],
    showVehicleSearch: false,
    availableSpots: [],
    selectedSpot: preSelectedSpot || null,
    reservationData: {
      ...initialReservationData,
      expected_checkin_date: selectedDate || formatDateForInput(new Date()),
      spot_number: preSelectedSpot?.spot_number.toString() || '',
      level_code: preSelectedSpot?.level_code || '',
    },
    showCheckinCalendar: false,
    showCheckoutCalendar: false,
  })

  // ============ HELPERS ============
  const updateState = useCallback((updates: Partial<BookingWizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setError = useCallback(
    (error: string) => {
      updateState({ error })
    },
    [updateState]
  )

  const clearError = useCallback(() => {
    updateState({ error: '' })
  }, [updateState])

  // ============ NAVEGACIÓN ============
  const setStep = useCallback(
    (step: number) => {
      updateState({ step })
    },
    [updateState]
  )

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }))
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step - 1 }))
  }, [])

  // ============ VEHÍCULO ============
  const setVehicleData = useCallback((data: Partial<VehicleData>) => {
    setState((prev) => ({
      ...prev,
      vehicleData: { ...prev.vehicleData, ...data },
    }))
  }, [])

  const handleSearchVehicles = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        updateState({
          vehicleSearchResults: [],
          showVehicleSearch: false,
        })
        return
      }

      updateState({ searchingVehicles: true })

      try {
        const allVehicles = await parkingApi.getAllVehicles()
        const filtered = allVehicles.filter(
          (v: ParkingVehicle) =>
            v.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        updateState({
          vehicleSearchResults: filtered.slice(0, 5),
          showVehicleSearch: filtered.length > 0,
          searchingVehicles: false,
        })
      } catch (err) {
        console.error('Error searching vehicles:', err)
        updateState({
          vehicleSearchResults: [],
          showVehicleSearch: false,
          searchingVehicles: false,
        })
      }
    },
    [updateState]
  )

  const handleSelectExistingVehicle = useCallback(
    (vehicle: VehicleSearchResult) => {
      updateState({
        vehicleData: {
          plate_number: vehicle.plate_number,
          owner_name: vehicle.owner_name,
          model: vehicle.model || '',
        },
        vehicleId: vehicle.id,
        showVehicleSearch: false,
        vehicleSearchResults: [],
      })
      toast.success(`Vehículo ${vehicle.plate_number} seleccionado`)
      setState((prev) => ({ ...prev, step: 2 }))
    },
    [updateState]
  )

  const handleCreateVehicle = useCallback(async () => {
    if (!state.vehicleData.plate_number || !state.vehicleData.owner_name) {
      setError('Matrícula y propietario son obligatorios')
      return
    }

    updateState({ loading: true, error: '' })

    try {
      const result = await parkingApi.createVehicle({
        plate_number: state.vehicleData.plate_number.toUpperCase(),
        owner_name: state.vehicleData.owner_name,
        model: state.vehicleData.model || undefined,
      })

      updateState({
        vehicleId: result.id,
        loading: false,
      })
      toast.success('Vehículo creado correctamente')
      setState((prev) => ({ ...prev, step: 2 }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear vehículo'
      updateState({ loading: false })
      setError(message)
      toast.error('Error al crear vehículo')
    }
  }, [state.vehicleData, updateState, setError])

  // ============ PLAZAS Y DISPONIBILIDAD ============
  const validateDates = useCallback(() => {
    if (
      !state.reservationData.expected_checkin_date ||
      !state.reservationData.expected_checkout_date
    )
      return false

    const checkin = new Date(
      `${state.reservationData.expected_checkin_date}T${state.reservationData.expected_checkin_time}`
    )
    const checkout = new Date(
      `${state.reservationData.expected_checkout_date}T${state.reservationData.expected_checkout_time}`
    )
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkout <= checkin) {
      setError('Fecha de salida debe ser posterior a entrada')
      return false
    }

    if (checkin < today) {
      setError('Fecha de entrada no puede ser en el pasado')
      return false
    }

    return true
  }, [state.reservationData, setError])

  const handleLoadAvailability = useCallback(async () => {
    if (
      !state.reservationData.expected_checkin_date ||
      !state.reservationData.expected_checkout_date
    ) {
      setError('Fechas requeridas')
      return
    }

    if (!validateDates()) return

    updateState({ loading: true, error: '', availableSpots: [] })

    try {
      const allSpots = await parkingApi.getAllSpots()
      const bookingsResponse = await parkingApi.getAllBookings({})

      const checkinDate = new Date(
        `${state.reservationData.expected_checkin_date}T${state.reservationData.expected_checkin_time}`
      )
      const checkoutDate = new Date(
        `${state.reservationData.expected_checkout_date}T${state.reservationData.expected_checkout_time}`
      )

      const available = allSpots.filter((spot: ParkingSpot) => {
        if (!spot.is_active) return false

        const hasConflict = bookingsResponse.bookings?.some((booking: ParkingBooking) => {
          if (booking.spot.id !== spot.id) return false
          if (!['reserved', 'checked_in'].includes(booking.status)) return false

          const bookingCheckin = new Date(booking.schedule.expected_checkin)
          const bookingCheckout = new Date(booking.schedule.expected_checkout)

          const conflict = !(checkoutDate <= bookingCheckin || checkinDate >= bookingCheckout)
          return conflict
        })

        return !hasConflict
      })

      // Transformar a ParkingSpotDisplay con status
      const availableWithStatus: ParkingSpotDisplay[] = available.map((spot: ParkingSpot) => ({
        id: spot.id,
        level_code: spot.level_code,
        spot_number: spot.spot_number,
        spot_type: spot.spot_type,
        status: 'free' as const,
      }))

      updateState({
        availableSpots: availableWithStatus,
        loading: false,
      })

      if (available.length === 0) {
        setError('No hay plazas disponibles en esas fechas')
        toast.error('No hay plazas disponibles')
      } else {
        toast.success(`${available.length} plazas disponibles`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar disponibilidad'
      console.error('❌ Error al cargar disponibilidad:', err)
      updateState({ loading: false })
      setError(message)
      toast.error('Error al cargar plazas')
    }
  }, [state.reservationData, updateState, setError, validateDates])

  const handleSelectSpot = useCallback((spot: ParkingSpotDisplay) => {
    const normalizeLevel = (levelCode: string) => levelCode.replace('-', '')
    const displayText = `Planta ${normalizeLevel(spot.level_code)} - Nº ${spot.spot_number}`

    setState((prev) => ({
      ...prev,
      selectedSpot: spot,
      reservationData: {
        ...prev.reservationData,
        spot_number: spot.spot_number.toString(),
        level_code: spot.level_code,
      },
    }))

    toast.success(displayText)
  }, [])

  // ============ RESERVA ============
  const setReservationData = useCallback((data: Partial<ReservationData>) => {
    setState((prev) => ({
      ...prev,
      reservationData: { ...prev.reservationData, ...data },
    }))
  }, [])

  const calculateDays = useCallback(() => {
    if (
      !state.reservationData.expected_checkin_date ||
      !state.reservationData.expected_checkout_date
    )
      return 0
    const checkin = new Date(
      `${state.reservationData.expected_checkin_date}T${state.reservationData.expected_checkin_time}`
    )
    const checkout = new Date(
      `${state.reservationData.expected_checkout_date}T${state.reservationData.expected_checkout_time}`
    )
    const diffTime = Math.abs(checkout.getTime() - checkin.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [state.reservationData])

  const handleCreateReservation = useCallback(async () => {
    if (!state.selectedSpot) {
      setError('Selecciona una plaza')
      return
    }

    if (
      !state.reservationData.expected_checkin_date ||
      !state.reservationData.expected_checkout_date
    ) {
      setError('Completa las fechas')
      return
    }

    // Validar spot_number antes de enviar
    const spotNumber = parseInt(state.reservationData.spot_number)
    if (isNaN(spotNumber)) {
      setError('Número de plaza inválido')
      return
    }

    // Validar total_amount si existe
    const totalAmount = state.reservationData.total_amount
      ? parseFloat(state.reservationData.total_amount)
      : undefined
    if (totalAmount !== undefined && isNaN(totalAmount)) {
      setError('Monto total inválido')
      return
    }

    updateState({ loading: true, error: '' })

    try {
      const checkinISO = `${state.reservationData.expected_checkin_date} ${state.reservationData.expected_checkin_time}`
      const checkoutISO = `${state.reservationData.expected_checkout_date} ${state.reservationData.expected_checkout_time}`

      const payload: CreateBookingDto = {
        spot_number: spotNumber,
        level_code: state.reservationData.level_code,
        vehicle_id: state.vehicleId ?? undefined,
        expected_checkin: checkinISO,
        expected_checkout: checkoutISO,
        source: state.reservationData.booking_source || 'direct',
        total_amount: totalAmount,
        external_id: state.reservationData.external_booking_id || undefined,
        notes: state.reservationData.notes || undefined,
      }

      await parkingApi.createBooking(payload)

      updateState({
        success: true,
        loading: false,
      })
      toast.success('¡Reserva creada exitosamente!')

      if (variant === 'full') {
        setState((prev) => ({ ...prev, step: 4 }))
      } else {
        // En modal, llamar onSuccess inmediatamente
        onSuccess?.()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear reserva'
      console.error('❌ Error al crear reserva:', err)
      updateState({ loading: false })
      setError(message)
      toast.error('Error al crear reserva')
    }
  }, [
    state.selectedSpot,
    state.reservationData,
    state.vehicleId,
    variant,
    onSuccess,
    updateState,
    setError,
  ])

  // ============ UI CONTROLS ============
  const setShowCheckinCalendar = useCallback(
    (show: boolean) => {
      updateState({ showCheckinCalendar: show })
    },
    [updateState]
  )

  const setShowCheckoutCalendar = useCallback(
    (show: boolean) => {
      updateState({ showCheckoutCalendar: show })
    },
    [updateState]
  )

  // ============ RETURN ============
  const actions: BookingWizardActions = {
    setStep,
    nextStep,
    prevStep,
    setVehicleData,
    handleSearchVehicles,
    handleSelectExistingVehicle,
    handleCreateVehicle,
    handleLoadAvailability,
    handleSelectSpot,
    setReservationData,
    handleCreateReservation,
    calculateDays,
    validateDates,
    setShowCheckinCalendar,
    setShowCheckoutCalendar,
    setError,
    clearError,
  }

  return { state, actions }
}
