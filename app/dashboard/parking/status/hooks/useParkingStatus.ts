// app/dashboard/parking/status/hooks/useParkingStatus.ts

'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parkingApi } from '@/app/lib/parking'
import { toast } from 'react-hot-toast'
import type {
  ParkingBooking,
  OverdueBooking,
  AvailabilityData,
  ParkingSpotDisplay,
  ParkingSpot,
} from '@/app/lib/parking/types'

export interface ParkingStatusMessages {
  operationError: string
  checkInSuccess: string
  checkOutSuccess: string
  cancelSuccess: string
  noShowSuccess: string
  deleteSuccess: string
  updateSuccess: string
}

const statsKey = (date: string) => ['parking', 'stats', date] as const
const bookingsKey = (date: string) => ['parking', 'bookings', date] as const
const overdueKey = () => ['parking', 'bookings', 'overdue'] as const
const spotsKey = (date: string) => ['parking', 'spots', date] as const

function deriveSpots(spots: ParkingSpot[], activeBookings: ParkingBooking[]): ParkingSpotDisplay[] {
  return spots.map((spot) => {
    const activeBooking = activeBookings.find((b) => {
      const matchesSpot =
        b.spot.id === spot.id ||
        (b.spot.number === spot.spot_number && b.spot.level === spot.level_code)

      return matchesSpot && ['reserved', 'checked_in'].includes(b.status)
    })

    let status: 'free' | 'reserved' | 'checked_in' = 'free'
    if (activeBooking) {
      status = activeBooking.status === 'checked_in' ? 'checked_in' : 'reserved'
    }

    return {
      id: spot.id,
      level_code: spot.level_code,
      spot_number: spot.spot_number,
      spot_type: spot.spot_type,
      status,
      booking: activeBooking,
    }
  })
}

function deriveActiveBookings(
  allBookings: ParkingBooking[],
  selectedDate: string
): ParkingBooking[] {
  const selectedDateObj = new Date(selectedDate)
  const selected = new Date(
    selectedDateObj.getFullYear(),
    selectedDateObj.getMonth(),
    selectedDateObj.getDate()
  )

  return allBookings.filter((b) => {
    if (!['reserved', 'checked_in'].includes(b.status)) return false

    const checkin = new Date(b.schedule.expected_checkin)
    const checkout = new Date(b.schedule.expected_checkout)

    const checkinDate = new Date(checkin.getFullYear(), checkin.getMonth(), checkin.getDate())
    const checkoutDate = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate())

    return checkinDate <= selected && selected <= checkoutDate
  })
}

export function useParkingStatus(selectedDate: string, messages: ParkingStatusMessages) {
  const queryClient = useQueryClient()

  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean
    booking: ParkingBooking | null
  }>({ isOpen: false, booking: null })

  const [checkinModal, setCheckinModal] = useState<{
    isOpen: boolean
    booking: ParkingBooking | null
  }>({ isOpen: false, booking: null })

  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    booking: ParkingBooking | null
  }>({ isOpen: false, booking: null })

  const [overdueModal, setOverdueModal] = useState<{
    isOpen: boolean
    booking: OverdueBooking | null
  }>({ isOpen: false, booking: null })

  const [createModal, setCreateModal] = useState<{
    isOpen: boolean
    spot: ParkingSpotDisplay | null
  }>({ isOpen: false, spot: null })

  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    booking: ParkingBooking | null
  }>({ isOpen: false, booking: null })

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    booking: ParkingBooking | null
  }>({ isOpen: false, booking: null })

  // Datos base
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: statsKey(selectedDate),
    queryFn: async () => parkingApi.getFullStats(selectedDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: bookingsKey(selectedDate),
    queryFn: async () => parkingApi.getAllBookings({}),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: overdueData,
    isLoading: overdueLoading,
    error: overdueError,
  } = useQuery({
    queryKey: overdueKey(),
    queryFn: async () => parkingApi.getOverdueBookings(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: spotsData,
    isLoading: spotsLoading,
    error: spotsError,
  } = useQuery({
    queryKey: spotsKey(selectedDate),
    queryFn: async () => parkingApi.getAllSpots(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const availabilityData: AvailabilityData | null =
    (statsData?.dashboard.availability as AvailabilityData | null) ?? null
  const allBookings = bookingsData?.bookings ?? []
  const activeBookings = deriveActiveBookings(allBookings, selectedDate)
  const overdueBookings = overdueData?.bookings ?? []
  const spots: ParkingSpotDisplay[] = spotsData ? deriveSpots(spotsData, activeBookings) : []

  const loading = statsLoading || bookingsLoading || spotsLoading || overdueLoading
  const error =
    (statsError as Error | undefined)?.message ||
    (bookingsError as Error | undefined)?.message ||
    (spotsError as Error | undefined)?.message ||
    (overdueError as Error | undefined)?.message ||
    null

  // Mutations helpers
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: statsKey(selectedDate) })
    queryClient.invalidateQueries({ queryKey: bookingsKey(selectedDate) })
    queryClient.invalidateQueries({ queryKey: spotsKey(selectedDate) })
    queryClient.invalidateQueries({ queryKey: overdueKey() })
  }

  const handleMutationError = (err: unknown) => {
    const message = err instanceof Error ? err.message : messages.operationError
    toast.error(message)
  }

  const checkInMutation = useMutation({
    mutationFn: (code: string) => parkingApi.checkInBooking(code),
    onSuccess: () => {
      toast.success(messages.checkInSuccess)
      setCheckinModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  const checkOutMutation = useMutation({
    mutationFn: (code: string) => parkingApi.checkOutBooking(code),
    onSuccess: () => {
      toast.success(messages.checkOutSuccess)
      setCheckoutModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  const cancelMutation = useMutation({
    mutationFn: (code: string) => parkingApi.cancelBooking(code),
    onSuccess: () => {
      toast.success(messages.cancelSuccess)
      setCancelModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  const noShowMutation = useMutation({
    mutationFn: (code: string) => parkingApi.markBookingNoShow(code),
    onSuccess: () => {
      toast.success(messages.noShowSuccess)
      setOverdueModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  const deleteMutation = useMutation({
    mutationFn: (code: string) => parkingApi.deleteBooking(code),
    onSuccess: () => {
      toast.success(messages.deleteSuccess)
      setOverdueModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  type UpdatePayload = {
    code: string
    data: {
      expected_checkin?: string
      expected_checkout?: string
      spot_number?: number
      level_code?: string
      vehicle_id?: number
      total_amount?: number
      booking_source?: string
      external_booking_id?: string
      notes?: string
    }
  }

  type PaymentPayload = {
    code: string
    data: {
      payment_amount: number
      payment_method: 'cash' | 'card' | 'transfer' | 'agency'
      payment_reference?: string
    }
  }

  const updateMutation = useMutation({
    mutationFn: ({ code, data }: UpdatePayload) => parkingApi.updateBooking(code, data),
    onSuccess: () => {
      toast.success(messages.updateSuccess)
      setEditModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  const paymentMutation = useMutation({
    mutationFn: ({ code, data }: PaymentPayload) => parkingApi.updateBooking(code, data),
    onSuccess: () => {
      toast.success('Pago registrado correctamente')
      setPaymentModal({ isOpen: false, booking: null })
      invalidateAll()
    },
    onError: handleMutationError,
  })

  const handleCheckIn = async (booking: ParkingBooking) => {
    setCheckinModal({ isOpen: true, booking })
  }

  const confirmCheckIn = async () => {
    if (!checkinModal.booking) return
    await checkInMutation.mutateAsync(checkinModal.booking.booking_code)
  }

  const handleCheckOut = async (booking: ParkingBooking) => {
    setCheckoutModal({ isOpen: true, booking })
  }

  const confirmCheckOut = async () => {
    if (!checkoutModal.booking) return
    await checkOutMutation.mutateAsync(checkoutModal.booking.booking_code)
  }

  const handleCancelBooking = async (booking: ParkingBooking) => {
    setCancelModal({ isOpen: true, booking })
  }

  const confirmCancelBooking = async () => {
    if (!cancelModal.booking) return
    await cancelMutation.mutateAsync(cancelModal.booking.booking_code)
  }

  const handleCreateBooking = (spot: ParkingSpotDisplay) => {
    setCreateModal({ isOpen: true, spot })
  }

  const handleEditBooking = (booking: ParkingBooking) => {
    setEditModal({ isOpen: true, booking })
  }

  const confirmEditBooking = async (data: {
    expected_checkin?: string
    expected_checkout?: string
    spot_number?: number
    level_code?: string
    vehicle_id?: number
    total_amount?: number
    booking_source?: string
    external_booking_id?: string
    notes?: string
  }) => {
    if (!editModal.booking) return
    await updateMutation.mutateAsync({ code: editModal.booking.booking_code, data })
  }

  const handlePaymentBooking = (booking: ParkingBooking) => {
    setPaymentModal({ isOpen: true, booking })
  }

  const confirmPayment = async (data: {
    payment_amount: number
    payment_method: 'cash' | 'card' | 'transfer' | 'agency'
    payment_reference?: string
  }) => {
    if (!paymentModal.booking) return
    await paymentMutation.mutateAsync({ code: paymentModal.booking.booking_code, data })
  }

  // Direct actions from EditBookingModal (without going through CancelModal)
  const confirmCancelFromEdit = async () => {
    if (!editModal.booking) return
    await cancelMutation.mutateAsync(editModal.booking.booking_code)
    setEditModal({ isOpen: false, booking: null })
  }

  const confirmNoShowFromEdit = async () => {
    if (!editModal.booking) return
    await noShowMutation.mutateAsync(editModal.booking.booking_code)
    setEditModal({ isOpen: false, booking: null })
  }

  const handleOverdueAction = async (action: 'checkout' | 'no-show' | 'cancel' | 'delete') => {
    if (!overdueModal.booking) return

    const code = overdueModal.booking.booking_code
    switch (action) {
      case 'checkout':
        await checkOutMutation.mutateAsync(code)
        break
      case 'no-show':
        await noShowMutation.mutateAsync(code)
        break
      case 'cancel':
        await cancelMutation.mutateAsync(code)
        break
      case 'delete':
        await deleteMutation.mutateAsync(code)
        break
    }

    setOverdueModal({ isOpen: false, booking: null })
  }

  return {
    // Data
    spots,
    availabilityData,
    bookings: activeBookings,
    overdueBookings,
    loading,
    error,

    // Modals state
    checkoutModal,
    checkinModal,
    cancelModal,
    overdueModal,
    createModal,
    editModal,
    paymentModal,
    actionLoading:
      checkInMutation.isPending ||
      checkOutMutation.isPending ||
      cancelMutation.isPending ||
      noShowMutation.isPending ||
      deleteMutation.isPending ||
      updateMutation.isPending ||
      paymentMutation.isPending,

    // Setters
    setCheckoutModal,
    setCheckinModal,
    setCancelModal,
    setOverdueModal,
    setCreateModal,
    setEditModal,
    setPaymentModal,

    // Actions
    handleCheckIn,
    confirmCheckIn,
    handleCheckOut,
    confirmCheckOut,
    handleCancelBooking,
    confirmCancelBooking,
    handleCreateBooking,
    handleEditBooking,
    confirmEditBooking,
    confirmCancelFromEdit,
    confirmNoShowFromEdit,
    handlePaymentBooking,
    confirmPayment,
    handleOverdueAction,
  }
}
