// NUNCA BORRAR ESTOS COMENTARIOS PORQUE SIRVEN DE GUÍA PARA REFACTORIZAR LOS DEMÁS ARCHIVOS
// TODO PASO 1: Layout como Server Component -> app/dashboard/parking/layout.tsx SIN 'use client'
// import ParkingNavigator from './components/ParkingNavigator'

// app/dashboard/parking/status/layout.tsx
// ✅ Server Component - NO 'use client'

import ParkingNavigator from './components/ParkingNavigator'

export default function ParkingStatusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Navegador con calendario y filtros - Client Component */}
      <ParkingNavigator />

      {/* Contenido de la página */}
      {children}
    </div>
  )
}

// // app/dashboard/parking/status/layout.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { FiChevronLeft, FiChevronRight, FiCalendar, FiPlus } from 'react-icons/fi'
// import { MdLocalParking } from 'react-icons/md'
// import Link from 'next/link'

// const getLocalDateString = (date: Date = new Date()): string => {
//   const year = date.getFullYear()
//   const month = String(date.getMonth() + 1).padStart(2, '0')
//   const day = String(date.getDate()).padStart(2, '0')
//   return `${year}-${month}-${day}`
// }

// export default function ParkingLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const [currentDate, setCurrentDate] = useState<Date | null>(null)
//   const [selectedDay, setSelectedDay] = useState<number | null>(null)
//   const [isClient, setIsClient] = useState(false)

//   const selectedLevel = searchParams?.get('level') || 'all'

//   useEffect(() => {
//     setIsClient(true)
//     const today = new Date()
//     setCurrentDate(today)
//     setSelectedDay(today.getDate())
//   }, [])

//   useEffect(() => {
//     if (!currentDate || selectedDay === null) return

//     const dateStr = getLocalDateString(
//       new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)
//     )
//     const currentLevel = searchParams?.get('level') || 'all'
//     router.push(`?date=${dateStr}&level=${currentLevel}`, { scroll: false })
//   }, [currentDate, selectedDay, router, searchParams])

//   if (!isClient || !currentDate || selectedDay === null) {
//     return (
//       <div className="flex items-center justify-center min-h-[200px]">
//         <div className="text-gray-500 dark:text-gray-400">Cargando calendario...</div>
//       </div>
//     )
//   }

//   const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' })
//   const currentYear = currentDate.getFullYear()
//   const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()
//   const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

//   const goToPreviousMonth = () => {
//     const newDate = new Date(currentDate)
//     newDate.setMonth(newDate.getMonth() - 1)
//     setCurrentDate(newDate)
//     setSelectedDay(1)
//   }

//   const goToNextMonth = () => {
//     const newDate = new Date(currentDate)
//     newDate.setMonth(newDate.getMonth() + 1)
//     setCurrentDate(newDate)
//     setSelectedDay(1)
//   }

//   const goToToday = () => {
//     const today = new Date()
//     setCurrentDate(today)
//     setSelectedDay(today.getDate())
//   }

//   const selectDay = (day: number) => {
//     setSelectedDay(day)
//     const dateStr = getLocalDateString(new Date(currentYear, currentDate.getMonth(), day))
//     const currentLevel = searchParams?.get('level') || 'all'
//     router.push(`?date=${dateStr}&level=${currentLevel}`, { scroll: false })
//   }

//   const selectLevel = (level: string) => {
//     const dateStr = searchParams?.get('date') || getLocalDateString()
//     router.push(`?date=${dateStr}&level=${level}`, { scroll: false })
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header sticky principal */}
//       <div className="sticky top-0 z-30 bg-white dark:bg-[#0d1117] shadow-sm">
//         <div className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 dark:border-gray-800">
//           {/* Desktop */}
//           <div className="hidden md:flex items-center gap-3 justify-between">
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
//                   <MdLocalParking className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <h1 className="text-base font-semibold text-gray-900 dark:text-white">
//                   Control de Parking
//                 </h1>
//               </div>

//               <div className="w-56 flex-shrink-0">
//                 <h2 className="text-base font-semibold text-gray-900 dark:text-white capitalize truncate">
//                   {currentMonth} {currentYear}
//                 </h2>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={goToPreviousMonth}
//                   className="p-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                 >
//                   <FiChevronLeft className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={goToNextMonth}
//                   className="p-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                 >
//                   <FiChevronRight className="w-4 h-4" />
//                 </button>
//               </div>

//               <button
//                 onClick={goToToday}
//                 className="ml-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
//               >
//                 <FiCalendar className="w-4 h-4" /> Hoy
//               </button>

//               {/* ✅ FIX: Desktop keys con prefijo */}
//               <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-300 dark:border-gray-700">
//                 {['all', '-2', '-3'].map((level) => (
//                   <button
//                     key={`desktop-${level}`} // ✅ AGREGADO PREFIJO
//                     onClick={() => selectLevel(level)}
//                     className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//                       selectedLevel === level
//                         ? 'bg-blue-600 text-white'
//                         : 'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
//                     }`}
//                   >
//                     {level === 'all' ? 'Todas' : `Planta ${level.replace('-', '')}`}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <Link href="/dashboard/parking/bookings/new">
//               <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors">
//                 <FiPlus className="w-4 h-4" /> Nueva Reserva
//               </button>
//             </Link>
//           </div>

//           {/* Mobile */}
//           <div className="md:hidden space-y-2">
//             <div className="flex items-center justify-between gap-2">
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
//                   <MdLocalParking className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <h1 className="text-base font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap w-20">
//                   {currentMonth.slice(0, 3)} {currentYear}
//                 </h1>
//                 <button
//                   onClick={goToPreviousMonth}
//                   className="p-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                 >
//                   <FiChevronLeft className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={goToNextMonth}
//                   className="p-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                 >
//                   <FiChevronRight className="w-4 h-4" />
//                 </button>
//               </div>

//               <button
//                 onClick={goToToday}
//                 className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 flex-shrink-0"
//               >
//                 <FiCalendar className="w-3.5 h-3.5" /> Hoy
//               </button>

//               <Link href="/dashboard/parking/bookings/new">
//                 <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap flex-shrink-0">
//                   <FiPlus className="w-3.5 h-3.5" /> Nuevo
//                 </button>
//               </Link>
//             </div>

//             {/* ✅ FIX: Mobile keys con prefijo */}
//             <div className="flex items-center gap-2">
//               {['all', '-2', '-3'].map((level) => (
//                 <button
//                   key={`mobile-${level}`} // ✅ AGREGADO PREFIJO
//                   onClick={() => selectLevel(level)}
//                   className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
//                     selectedLevel === level
//                       ? 'bg-blue-600 text-white'
//                       : 'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
//                   }`}
//                 >
//                   {level === 'all' ? 'Todas' : `Planta ${level.replace('-', '')}`}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Paginación sticky */}
//       <div className="sticky top-[64px] z-30 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
//         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
//           {days.map((day) => {
//             const date = new Date(currentYear, currentDate.getMonth(), day)
//             const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })

//             const isToday =
//               day === new Date().getDate() &&
//               currentDate.getMonth() === new Date().getMonth() &&
//               currentYear === new Date().getFullYear()

//             const isSelected = day === selectedDay

//             return (
//               <button
//                 key={`day-${currentYear}-${currentDate.getMonth()}-${day}`} // ✅ Agregado prefijo 'day-'
//                 onClick={() => selectDay(day)}
//                 className={`flex-shrink-0 w-12 h-12 rounded-lg font-medium flex flex-col items-center justify-center transition-all ${
//                   isSelected
//                     ? 'bg-blue-600 text-white shadow-lg scale-105'
//                     : isToday
//                       ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400'
//                       : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//               >
//                 <span className="text-[10px] font-normal">{weekday}</span>
//                 <span className="text-sm font-medium">{day}</span>
//               </button>
//             )
//           })}
//         </div>
//       </div>

//       {children}
//     </div>
//   )
// }
