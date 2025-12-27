// app/dashboard/cashier/hotel/page.tsx
'use client'

import { useTranslations } from 'next-intl'
import {
  useCashierStore,
  useSelectedDate,
  useActiveTab,
  useActiveModal,
} from '@/app/stores/useCashierStore'
import { useDailyDetails } from '@/app/lib/cashier/queries'
import type { CashierShift } from '@/app/lib/cashier/types'

// Components
import LoadingState from '@/app/components/cashier/LoadingState'
import ErrorState from '@/app/components/cashier/ErrorState'
import UninitializedDayState from '@/app/components/cashier/UninitializedDayState'
import DaySummarySidebar from '@/app/components/cashier/layout/DaySummarySidebar'
import ShiftTabs from '@/app/components/cashier/ShiftTabs'
import ShiftCard from '@/app/components/cashier/ShiftCard'

// Modals
import InitializeDayModal from '@/app/components/cashier/InitializeDayModal'
import CloseDayModal from '@/app/components/cashier/CloseDayModal'
import ReopenDayModal from '@/app/components/cashier/ReopenDayModal'

// Icons
import { FiDollarSign, FiCreditCard, FiAlertCircle } from 'react-icons/fi'

export default function CashierPage() {
  const t = useTranslations('cashier')
  // Zustand selectors (optimizados para evitar re-renders innecesarios)
  const selectedDate = useSelectedDate()
  const activeTab = useActiveTab()
  const activeModal = useActiveModal()
  const { setActiveTab, openModal, closeModal } = useCashierStore()

  const { data: dailyData, isLoading, error } = useDailyDetails(selectedDate)

  if (isLoading) {
    return <LoadingState message={t('page.loading')} />
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />
  }

  if (!dailyData) {
    return (
      <>
        <UninitializedDayState onInitialize={() => openModal('initializeDay')} />
        <InitializeDayModal
          isOpen={activeModal === 'initializeDay'}
          onClose={closeModal}
          selectedDate={selectedDate}
        />
      </>
    )
  }

  const currentShift = dailyData.shifts?.find((s: CashierShift) => s.shift_type === activeTab)

  // Calcular totales para mobile stats
  const totalCash = parseFloat(dailyData.total_cash || '0')
  const totalCard = parseFloat(dailyData.total_card || '0')
  const totalBacs = parseFloat(dailyData.total_bacs || '0')
  const totalWebPayment = parseFloat(dailyData.total_web_payment || '0')
  const totalTransfer = parseFloat(dailyData.total_transfer || '0')
  const totalOther = parseFloat(dailyData.total_other || '0')
  const grandTotal = parseFloat(dailyData.grand_total || '0')
  const electronicPayments = totalCard + totalBacs + totalWebPayment + totalTransfer + totalOther

  return (
    <>
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-5">
        {/* Left Column - Main Content */}
        <div className="min-[1400px]:col-span-3 space-y-4">
          {/* Stats - Mobile/Tablet (hidden on >= 1400px) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 min-[1400px]:hidden">
            <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {t('summary.grandTotal')}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                    {grandTotal.toFixed(2)}€
                  </p>
                </div>
                <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {t('summary.cash')}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                    {totalCash.toFixed(2)}€
                  </p>
                </div>
                <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {t('summary.electronic')}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400 mt-0.5">
                    {electronicPayments.toFixed(2)}€
                  </p>
                </div>
                <FiCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {t('summary.status')}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                    {dailyData.status === 'closed' ? t('summary.closed') : t('summary.open')}
                  </p>
                </div>
                {dailyData.status === 'closed' ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-medium rounded-full">
                    ✓
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-medium rounded-full">
                    ●
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="min-[1400px]:hidden">
            {dailyData.can_close && (
              <button
                onClick={() => openModal('closeDay')}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiDollarSign className="w-3.5 h-3.5" />
                {t('common.close')} {t('calendar.date')}
              </button>
            )}
            {dailyData.status === 'closed' && (
              <button
                onClick={() => openModal('reopenDay')}
                className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiAlertCircle className="w-3.5 h-3.5" />
                {t('reopenDay.title')}
              </button>
            )}
          </div>

          {/* Validation Errors - Mobile */}
          {dailyData.validation_errors && dailyData.validation_errors.length > 0 && (
            <div className="min-[1400px]:hidden bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-1">{t('closeShift.validations')}:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {dailyData.validation_errors.map((error: string, idx: number) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tabs de turnos */}
          <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <ShiftTabs shifts={dailyData.shifts} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="p-4">
              {currentShift ? (
                <ShiftCard shiftId={currentShift.id} shiftType={activeTab} />
              ) : (
                <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
                  <p>{t('page.shiftNotCreated')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary Sidebar (visible on >= 1400px) */}
        <div className="hidden min-[1400px]:block">
          <DaySummarySidebar
            daily={dailyData}
            selectedDate={selectedDate}
            activeShiftType={activeTab}
            onCloseDay={() => openModal('closeDay')}
            onReopenDay={() => openModal('reopenDay')}
          />
        </div>
      </div>

      {/* Modal de cerrar día */}
      <CloseDayModal
        isOpen={activeModal === 'closeDay'}
        onClose={closeModal}
        dailyData={dailyData}
        selectedDate={selectedDate}
      />

      {/* Modal de reabrir día */}
      <ReopenDayModal
        isOpen={activeModal === 'reopenDay'}
        onClose={closeModal}
        selectedDate={selectedDate}
      />
    </>
  )
}
