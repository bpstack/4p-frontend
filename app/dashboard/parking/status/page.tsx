// NUNCA BORRAR ESTOS COMENTARIOS PORQUE SIRVEN DE GUÍA PARA REFACTORIZAR LOS DEMÁS ARCHIVOS
// TODO PASO 3: Page como Server Component que pasa props al Client Component -> SIN 'use client'
// import ParkingStatusClient from './components/ParkingStatusClient'

// app/dashboard/parking/status/page.tsx

// ✅ Server Component - NO 'use client'

import ParkingStatusClient from './components/ParkingStatusClient'
import { formatDateForInput } from '@/app/lib/helpers/date' // ✅ Mismo archivo que logbooks

interface PageProps {
  searchParams: Promise<{ date?: string; level?: string }>
}

export default async function ParkingStatusPage({ searchParams }: PageProps) {
  const params = await searchParams
  const dateFromUrl = params.date
  const levelFromUrl = params.level || 'all'

  const selectedDate = dateFromUrl || formatDateForInput(new Date())

  return <ParkingStatusClient selectedDate={selectedDate} levelFromUrl={levelFromUrl} />
}
// 'use client'

// import React from 'react'
// import { useSearchParams } from 'next/navigation'
// import { formatDateForInput } from '@/app/ui/calendar/simplecalendar'
// import { useParkingStatus } from './hooks/useParkingStatus'
// import ParkingTable from './components/ParkingTable'
// import StatusPanels from './components/StatusPanels'
// import { CheckInModal, CheckOutModal, CancelModal, OverdueModal } from './components/modals'
// import BookingWizard from '@/app/components/booking/BookingWizard'

// export default function ParkingStatusPage() {
//   const searchParams = useSearchParams()
//   const dateFromUrl = searchParams?.get('date')
//   const levelFromUrl = searchParams?.get('level') || 'all'

//   const selectedDate = dateFromUrl || formatDateForInput(new Date())

//   const {
//     // Data
//     spots,
//     availabilityData,
//     overdueBookings,
//     loading,

//     // Modals state
//     checkoutModal,
//     checkinModal,
//     cancelModal,
//     overdueModal,
//     createModal,
//     actionLoading,

//     // Setters
//     setCheckoutModal,
//     setCheckinModal,
//     setCancelModal,
//     setOverdueModal,
//     setCreateModal,

//     // Actions
//     handleCheckIn,
//     confirmCheckIn,
//     handleCheckOut,
//     confirmCheckOut,
//     handleCancelBooking,
//     confirmCancelBooking,
//     handleCreateBooking,
//     handleOverdueAction,
//     loadParkingData,
//   } = useParkingStatus(selectedDate)

//   const filteredSpots =
//     levelFromUrl === 'all' ? spots : spots.filter((s) => s.level_code === levelFromUrl)

//   const levels = availabilityData?.levels || []
//   const selectedLevelData =
//     levelFromUrl === 'all'
//       ? availabilityData?.summary
//       : levels.find((l) => l.level === levelFromUrl)

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-20 h-20 border-4 border-gray-300 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-6" />
//           <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
//             Cargando datos del parking...
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           {selectedLevelData && (
//             <div className="bg-[#f6f8fa] dark:bg-[#0d1117] border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
//                 {levelFromUrl === 'all'
//                   ? 'Todas las Plantas'
//                   : `Planta ${levelFromUrl.replace('-', '')}`}
//               </h2>
//               <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-indigo-500 rounded-full" />
//                   <span>
//                     Ocupación:{' '}
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {Math.round(selectedLevelData.occupancy_rate)}%
//                     </span>
//                   </span>
//                 </div>
//                 <div className="w-px h-2 bg-gray-300 dark:bg-gray-700" />
//                 <span>
//                   Disponibles:{' '}
//                   <span className="font-semibold text-emerald-600 dark:text-emerald-400">
//                     {selectedLevelData.available_spots}
//                   </span>
//                   /{selectedLevelData.total_spots}
//                 </span>
//               </div>
//             </div>
//           )}

//           <ParkingTable
//             spots={filteredSpots || []}
//             levelFromUrl={levelFromUrl}
//             onCheckIn={handleCheckIn}
//             onCheckOut={handleCheckOut}
//             onCancel={handleCancelBooking}
//             onCreateBooking={handleCreateBooking}
//           />
//         </div>

//         <StatusPanels
//           availabilityData={availabilityData}
//           spots={filteredSpots || []}
//           overdueBookings={overdueBookings || []}
//           onCheckIn={handleCheckIn}
//           onCheckOut={handleCheckOut}
//           onOverdueClick={(booking) => setOverdueModal({ isOpen: true, booking })}
//         />
//       </div>

//       <CheckInModal
//         booking={checkinModal.booking}
//         isOpen={checkinModal.isOpen}
//         onClose={() => setCheckinModal({ isOpen: false, booking: null })}
//         onConfirm={confirmCheckIn}
//         loading={actionLoading}
//       />

//       <CheckOutModal
//         booking={checkoutModal.booking}
//         isOpen={checkoutModal.isOpen}
//         onClose={() => setCheckoutModal({ isOpen: false, booking: null })}
//         onConfirm={confirmCheckOut}
//         loading={actionLoading}
//       />

//       <CancelModal
//         booking={cancelModal.booking}
//         isOpen={cancelModal.isOpen}
//         onClose={() => setCancelModal({ isOpen: false, booking: null })}
//         onConfirm={confirmCancelBooking}
//         loading={actionLoading}
//       />

//       <OverdueModal
//         booking={overdueModal.booking}
//         isOpen={overdueModal.isOpen}
//         onClose={() => setOverdueModal({ isOpen: false, booking: null })}
//         onAction={handleOverdueAction}
//         loading={actionLoading}
//       />

//       {createModal.isOpen && createModal.spot && (
//         <BookingWizard
//           variant="modal"
//           preSelectedSpot={createModal.spot}
//           selectedDate={selectedDate}
//           onSuccess={() => {
//             setCreateModal({ isOpen: false, spot: null })
//             loadParkingData()
//           }}
//           onCancel={() => setCreateModal({ isOpen: false, spot: null })}
//         />
//       )}
//     </div>
//   )
// }
