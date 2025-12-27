// app/dashboard/cashier/reports/page.tsx
'use client'

import { useTranslations } from 'next-intl'
import {
  useCashierStore,
  useReportsDate,
  useReportsTab,
  useChartViewMode,
} from '@/app/stores/useCashierStore'
import DateNavigator from '@/app/components/cashier/DateNavigator'
import MonthlyReport from '@/app/components/cashier/reports/MonthlyReport'
import PaymentChart from '@/app/components/cashier/reports/PaymentChart'
import VouchersHistory from '@/app/components/cashier/reports/VouchersHistory'
import ReportsSummarySidebar from '@/app/components/cashier/layout/ReportsSummarySidebar'
import { useMonthlyReport } from '@/app/lib/cashier/queries'
import { FiTrendingUp, FiDollarSign, FiCreditCard, FiCheckCircle } from 'react-icons/fi'

export default function ReportsPage() {
  const t = useTranslations('cashier')

  const TAB_CONFIG: { id: 'summary' | 'payments' | 'vouchers'; label: string }[] = [
    { id: 'summary', label: t('reports.monthlySummary') },
    { id: 'payments', label: t('reports.paymentMethods') },
    { id: 'vouchers', label: t('reports.vouchersHistory') },
  ]

  // Zustand store
  const {
    getReportsDisplayLabel,
    reportsGoToPreviousMonth,
    reportsGoToNextMonth,
    reportsGoToCurrentMonth,
    setReportsTab,
    setChartViewMode,
  } = useCashierStore()

  const { year, month } = useReportsDate()
  const activeTab = useReportsTab()
  const chartViewMode = useChartViewMode()

  // Query
  const { data: reportData } = useMonthlyReport(year, month)

  // Parse report data for sidebar
  const parsedReport = reportData
    ? {
        grandTotal: parseFloat(String(reportData.totals?.grand_total)) || 0,
        totalCash: parseFloat(String(reportData.totals?.total_cash)) || 0,
        electronicPayments:
          (parseFloat(String(reportData.totals?.total_card)) || 0) +
          (parseFloat(String(reportData.totals?.total_bacs)) || 0) +
          (parseFloat(String(reportData.totals?.total_web_payment)) || 0) +
          (parseFloat(String(reportData.totals?.total_transfer)) || 0) +
          (parseFloat(String(reportData.totals?.total_other)) || 0),
        daysClosed: reportData.period?.days_closed || 0,
        totalDays: reportData.period?.total_days || 0,
        averageDaily:
          (parseFloat(String(reportData.totals?.grand_total)) || 0) /
          (reportData.period?.total_days || 1),
      }
    : null

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1400px] space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('reports.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {t('reports.pageSubtitle')}
            </p>
          </div>

          <DateNavigator
            displayLabel={getReportsDisplayLabel()}
            onPrevious={reportsGoToPreviousMonth}
            onNext={reportsGoToNextMonth}
            onToday={reportsGoToCurrentMonth}
            labelMinWidth="140px"
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-5">
          {/* Left Column - Main Content */}
          <div className="min-[1400px]:col-span-3 space-y-4">
            {/* Stats - Mobile/Tablet (hidden on >= 1400px) */}
            {parsedReport && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 min-[1400px]:hidden">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-green-700 dark:text-green-300 font-medium">
                        {t('reports.grandTotal')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100 mt-0.5">
                        {parsedReport.grandTotal.toFixed(2)}€
                      </p>
                    </div>
                    <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('reports.cash')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {parsedReport.totalCash.toFixed(2)}€
                      </p>
                    </div>
                    <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('reports.electronic')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {parsedReport.electronicPayments.toFixed(2)}€
                      </p>
                    </div>
                    <FiCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('reports.daysClosed')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {parsedReport.daysClosed}/{parsedReport.totalDays}
                      </p>
                    </div>
                    <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-1">
              <div className="flex gap-1">
                {TAB_CONFIG.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setReportsTab(tab.id)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              {activeTab === 'summary' && <MonthlyReport year={year} month={month} />}

              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {/* Toggle view mode */}
                  <div className="flex justify-end">
                    <div className="inline-flex bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => setChartViewMode('pie')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          chartViewMode === 'pie'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t('reports.pie')}
                      </button>
                      <button
                        onClick={() => setChartViewMode('bar')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          chartViewMode === 'bar'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t('reports.bar')}
                      </button>
                    </div>
                  </div>

                  {reportData && <PaymentChart report={reportData} viewMode={chartViewMode} />}
                </div>
              )}

              {activeTab === 'vouchers' && <VouchersHistory year={year} month={month} />}
            </div>
          </div>

          {/* Right Column - Summary Sidebar (visible on >= 1400px) */}
          <div className="hidden min-[1400px]:block">
            {parsedReport && (
              <ReportsSummarySidebar
                grandTotal={parsedReport.grandTotal}
                totalCash={parsedReport.totalCash}
                electronicPayments={parsedReport.electronicPayments}
                daysClosed={parsedReport.daysClosed}
                totalDays={parsedReport.totalDays}
                averageDaily={parsedReport.averageDaily}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
