//NUNCA BORRAR ESTOS COMENTARIOS PORQUE SIRVEN DE GUÍA PARA REFACTORIZAR LOS DEMÁS ARCHIVOS

//PASO 3: Page como Server Component que pasa props al Client Component -> // app/dashboard/parking/status/page.tsx
//PASO 4: Client Component que consume hooks y maneja interactividad
// app/dashboard/parking/status/components/ParkingStatusClient.tsx
'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParkingStatus, type ParkingStatusMessages } from '../hooks/useParkingStatus'
import ParkingTable from './ParkingTable'
import StatusPanels from './StatusPanels'
import { CheckInModal, CheckOutModal, CancelModal, OverdueModal } from './modals'
import { EditBookingModal } from '@/app/components/parking/bookings/EditBookingModal'
import { PaymentModal } from '@/app/components/parking/bookings/PaymentModal'
import BookingWizard from '@/app/components/booking/BookingWizard'

interface ParkingStatusClientProps {
  selectedDate: string
  levelFromUrl: string
}

export default function ParkingStatusClient({
  selectedDate,
  levelFromUrl,
}: ParkingStatusClientProps) {
  const t = useTranslations('parking')
  const tCommon = useTranslations('common')

  // Memoize messages object to prevent unnecessary re-renders
  const messages: ParkingStatusMessages = useMemo(
    () => ({
      operationError: tCommon('errors.operationError'),
      checkInSuccess: t('messages.checkInSuccess'),
      checkOutSuccess: t('messages.checkOutSuccess'),
      cancelSuccess: t('modals.cancelBooking.success'),
      noShowSuccess: t('modals.noShow.success'),
      deleteSuccess: t('bookingDetail.toasts.deleteSuccess'),
      updateSuccess: t('messages.updateSuccess'),
    }),
    [t, tCommon]
  )

  const {
    // Data
    spots,
    availabilityData,
    overdueBookings,
    loading,

    // Modals state
    checkoutModal,
    checkinModal,
    cancelModal,
    overdueModal,
    createModal,
    editModal,
    paymentModal,
    actionLoading,

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
  } = useParkingStatus(selectedDate, messages)

  const filteredSpots =
    levelFromUrl === 'all' ? spots : spots.filter((s) => s.level_code === levelFromUrl)

  const levels = availabilityData?.levels || []
  const selectedLevelData =
    levelFromUrl === 'all'
      ? availabilityData?.summary
      : levels.find((l) => l.level === levelFromUrl)

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-[1400px] space-y-6">
          {/* Skeleton mobile/tablet: paneles horizontales */}
          <div className="2xl:hidden grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg p-4"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
            {/* Contenido principal */}
            <div className="2xl:col-span-3 space-y-6">
              {/* Skeleton del panel de ocupación */}
              <div className="bg-gray-50 dark:bg-[#0d1117] border-2 border-gray-200 dark:border-[#30363d] rounded-2xl p-5">
                <div className="h-7 w-48 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse mb-3"></div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton de la tabla */}
              <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d] px-6 py-4">
                  <div className="grid grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-[#30363d]">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="grid grid-cols-5 gap-4">
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className="h-4 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton sidebar derecho */}
            <div className="hidden 2xl:block 2xl:col-span-1 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg p-6"
                >
                  <div className="h-6 w-40 bg-gray-200 dark:bg-[#21262d] rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className="h-16 bg-gray-100 dark:bg-[#161b22] rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-[1400px] space-y-6">
        {/* Mobile/Tablet: StatusPanels horizontal arriba */}
        <div className="2xl:hidden">
          <StatusPanels
            availabilityData={availabilityData}
            spots={filteredSpots || []}
            overdueBookings={overdueBookings || []}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOverdueClick={(booking) => setOverdueModal({ isOpen: true, booking })}
            layout="horizontal"
          />
        </div>

        {/* Grid principal: 4 columnas en >=1400px */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
          {/* Contenido principal: 3 columnas */}
          <div className="2xl:col-span-3 space-y-6">
            {selectedLevelData && (
              <div className="bg-[#f6f8fa] dark:bg-[#0d1117] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {levelFromUrl === 'all'
                    ? t('statusPage.allLevels')
                    : t('statusPage.level', { level: levelFromUrl.replace('-', '') })}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                    <span>
                      {t('statusPage.occupancy')}:{' '}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {Math.round(selectedLevelData.occupancy_rate)}%
                      </span>
                    </span>
                  </div>
                  <div className="w-px h-2 bg-gray-300 dark:bg-gray-700" />
                  <span>
                    {t('statusPage.available')}:{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedLevelData.available_spots}
                    </span>
                    /{selectedLevelData.total_spots}
                  </span>
                </div>
              </div>
            )}

            <ParkingTable
              spots={filteredSpots || []}
              levelFromUrl={levelFromUrl}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCancel={handleCancelBooking}
              onCreateBooking={handleCreateBooking}
              onEdit={handleEditBooking}
              onPayment={handlePaymentBooking}
            />
          </div>

          {/* Sidebar derecho: solo visible en >=1400px (2xl) */}
          <div className="hidden 2xl:block 2xl:col-span-1">
            <StatusPanels
              availabilityData={availabilityData}
              spots={filteredSpots || []}
              overdueBookings={overdueBookings || []}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onOverdueClick={(booking) => setOverdueModal({ isOpen: true, booking })}
              layout="vertical"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CheckInModal
        booking={checkinModal.booking}
        isOpen={checkinModal.isOpen}
        onClose={() => setCheckinModal({ isOpen: false, booking: null })}
        onConfirm={confirmCheckIn}
        loading={actionLoading}
      />

      <CheckOutModal
        booking={checkoutModal.booking}
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, booking: null })}
        onConfirm={confirmCheckOut}
        loading={actionLoading}
      />

      <CancelModal
        booking={cancelModal.booking}
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, booking: null })}
        onConfirm={confirmCancelBooking}
        loading={actionLoading}
      />

      <OverdueModal
        booking={overdueModal.booking}
        isOpen={overdueModal.isOpen}
        onClose={() => setOverdueModal({ isOpen: false, booking: null })}
        onAction={handleOverdueAction}
        loading={actionLoading}
      />

      {createModal.isOpen && createModal.spot && (
        <BookingWizard
          variant="modal"
          preSelectedSpot={createModal.spot}
          selectedDate={selectedDate}
          onSuccess={() => {
            setCreateModal({ isOpen: false, spot: null })
          }}
          onCancel={() => setCreateModal({ isOpen: false, spot: null })}
        />
      )}

      {editModal.isOpen && editModal.booking && (
        <EditBookingModal
          booking={editModal.booking}
          onClose={() => setEditModal({ isOpen: false, booking: null })}
          onConfirm={confirmEditBooking}
          onCancel={confirmCancelFromEdit}
          onNoShow={confirmNoShowFromEdit}
        />
      )}

      {paymentModal.isOpen && paymentModal.booking && (
        <PaymentModal
          booking={paymentModal.booking}
          onClose={() => setPaymentModal({ isOpen: false, booking: null })}
          onConfirm={confirmPayment}
        />
      )}
    </div>
  )
}
