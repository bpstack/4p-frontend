// app/components/conciliation/ConciliationClient.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiChevronLeft, FiChevronRight, FiCalendar, FiPlus } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { conciliationApi, type ConciliationDetail } from '@/app/lib/conciliation'
import HorizontalDatePicker from '@/app/ui/calendar/HorizontalDatePicker'
import ConciliationForm from './ConciliationForm'

export default function ConciliationClient() {
  const t = useTranslations('conciliation')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [selectedConciliation, setSelectedConciliation] = useState<ConciliationDetail | null>(null)
  const [dayStatusMessage, setDayStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Info del mes
  const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' })
  const currentYear = currentDate.getFullYear()

  // Cargar conciliacion de un dia especifico
  const loadConciliation = useCallback(async (year: number, month: number, day: number) => {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    setLoading(true)
    try {
      const conciliation = await conciliationApi.getByDay(dateString)

      if (conciliation) {
        setSelectedConciliation(conciliation)
        setDayStatusMessage('')
      } else {
        setSelectedConciliation(null)
        setDayStatusMessage(t('page.noConciliation'))
      }
    } catch (error: unknown) {
      console.error('Error loading conciliation:', error)
      setSelectedConciliation(null)
      setDayStatusMessage(t('page.errorLoading'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear nueva conciliacion
  const handleCreateConciliation = async () => {
    const dateString = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`

    try {
      await conciliationApi.create({
        date: dateString,
        notes: '',
      })

      // Recargar la conciliacion creada
      await loadConciliation(currentYear, currentDate.getMonth() + 1, selectedDay)
    } catch (error: unknown) {
      console.error('Error creating conciliation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      if (errorMessage.includes('Ya existe')) {
        setDayStatusMessage(t('page.alreadyExists'))
        await loadConciliation(currentYear, currentDate.getMonth() + 1, selectedDay)
      } else {
        setDayStatusMessage(t('page.errorCreating'))
      }
    }
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
    setSelectedDay(1)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
    setSelectedDay(1)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDay(today.getDate())
    loadConciliation(today.getFullYear(), today.getMonth() + 1, today.getDate())
  }

  const selectDay = (day: number) => {
    setSelectedDay(day)
    loadConciliation(currentYear, currentDate.getMonth() + 1, day)
  }

  useEffect(() => {
    loadConciliation(currentYear, currentDate.getMonth() + 1, selectedDay)
  }, [currentDate, currentYear, selectedDay, loadConciliation])

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409]">
      {/* Header sticky principal - Full width */}
      <div className="sticky top-0 z-30 bg-white dark:bg-[#010409] shadow-sm">
        <div className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 dark:border-gray-800">
          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-56 flex-shrink-0">
                <h1 className="text-base font-semibold text-gray-900 dark:text-white capitalize truncate">
                  {currentMonth} {currentYear}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={goToToday}
                className="ml-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
              >
                <FiCalendar className="w-4 h-4" /> {t('header.today')}
              </button>
              {selectedConciliation && (
                <div className="ml-4 text-sm text-gray-700 dark:text-gray-400 flex-shrink-0">
                  {t('header.status')}:{' '}
                  <span
                    className={`font-medium px-2 py-0.5 rounded ${
                      selectedConciliation.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : selectedConciliation.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {selectedConciliation.status === 'draft'
                      ? t('status.draft')
                      : selectedConciliation.status === 'confirmed'
                        ? t('status.confirmed')
                        : t('status.closed')}
                  </span>
                </div>
              )}
            </div>
            {!selectedConciliation && (
              <button
                onClick={handleCreateConciliation}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
              >
                <FiPlus className="w-4 h-4" /> {t('header.newConciliation')}
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                {currentMonth.slice(0, 3)} {currentYear}
              </h1>
              <button
                onClick={goToPreviousMonth}
                className="p-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 flex-shrink-0"
            >
              <FiCalendar className="w-3.5 h-3.5" /> {t('header.today')}
            </button>
            {!selectedConciliation && (
              <button
                onClick={handleCreateConciliation}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                <FiPlus className="w-3.5 h-3.5" /> {t('header.newMobile')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendario de dias - Full width */}
      <div className="sticky top-[64px] z-30">
        <HorizontalDatePicker
          currentDate={currentDate}
          selectedDay={selectedDay}
          onSelectDay={selectDay}
          locale="es-ES"
        />
      </div>

      {/* Formulario - Constrained width */}
      <div className="p-4 md:p-6">
        <div className="max-w-[1400px]">
          <ConciliationForm
            conciliation={selectedConciliation}
            loading={loading}
            dayStatusMessage={dayStatusMessage}
            onUpdate={() => loadConciliation(currentYear, currentDate.getMonth() + 1, selectedDay)}
          />
        </div>
      </div>
    </div>
  )
}
