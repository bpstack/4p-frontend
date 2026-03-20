// app/components/scheduling/SchedulingClient.tsx

'use client'

import { useTranslations } from 'next-intl'
import { useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulingApi, schedulingKeys, downloadSchedulePdf } from '@/app/lib/scheduling'
import { ApiError } from '@/app/lib/apiClient'
import type {
  SchedulingShift,
  SchedulingMonth,
  MonthStatus,
  GenerationWarning,
  BulkAssignmentDto,
} from '@/app/lib/scheduling'
import { ScheduleGrid } from './ScheduleGrid'
import type { BulkSelection } from './ScheduleGrid'
import { MonthSelector } from './MonthSelector'
import { ScheduleStats } from './ScheduleStats'
import { ShiftLegend } from './ShiftLegend'
import { ShiftSelector } from './ShiftSelector'
import { ValidationWarnings } from './ValidationWarnings'
import { MonthInfoPanel } from './MonthInfoPanel'
import { ManageHolidaysModal } from './ManageHolidaysModal'
import { ConfirmDialog } from '@/app/ui/panels/ConfirmDialog'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
  FiCalendar,
  FiCheck,
  FiSettings,
  FiDownload,
  FiRefreshCw,
  FiRotateCcw,
  FiTrash2,
} from 'react-icons/fi'

// Cell selection state for editing
interface SelectedCell {
  employeeId: string
  employeeName: string
  dayId: number
  dayNumber: number
  assignmentId: number | null
  currentShiftCode: string | null
  position: { x: number; y: number }
}

export function SchedulingClient() {
  const t = useTranslations('scheduling')
  const tToasts = useTranslations('scheduling.toasts')
  const tActions = useTranslations('scheduling.actions')
  const tMessages = useTranslations('scheduling.messages')
  const tStatus = useTranslations('scheduling.status')

  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get year and monthId from URL params
  const currentYear = new Date().getFullYear()
  const yearParam = searchParams.get('year')
  const monthIdParam = searchParams.get('month')

  const selectedYear = yearParam ? parseInt(yearParam, 10) : currentYear
  const selectedMonthId = monthIdParam ? parseInt(monthIdParam, 10) : null

  // Local state for cell selection (doesn't need URL persistence)
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)

  // State for validation warnings
  const [validationWarnings, setValidationWarnings] = useState<{
    warnings: GenerationWarning[]
  } | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'reset' | 'delete' | null
  }>({ open: false, type: null })

  // Holidays modal state
  const [showHolidaysModal, setShowHolidaysModal] = useState(false)

  // Bulk multi-cell selection state
  const [bulkSelection, setBulkSelection] = useState<BulkSelection | null>(null)

  // Update URL when year changes
  const setSelectedYear = useCallback(
    (year: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (year === currentYear) {
        params.delete('year')
      } else {
        params.set('year', String(year))
      }
      // Clear month selection when year changes
      params.delete('month')
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, pathname, searchParams, currentYear]
  )

  // Update URL when month selection changes
  const setSelectedMonthId = useCallback(
    (monthId: number | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (monthId === null) {
        params.delete('month')
      } else {
        params.set('month', String(monthId))
      }
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Fetch all months for the selector
  const { data: monthsData, isLoading: loadingMonths } = useQuery({
    queryKey: schedulingKeys.monthsList({ year: selectedYear }),
    queryFn: () => schedulingApi.getAllMonths({ year: selectedYear }),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch shifts for legend and cell rendering
  const { data: shifts = [] } = useQuery({
    queryKey: schedulingKeys.shifts(),
    queryFn: schedulingApi.getAllShifts,
    staleTime: 30 * 60 * 1000,
  })

  // Fetch full month data when a month is selected
  const {
    data: monthData,
    isLoading: loadingMonth,
    refetch: _refetchMonth,
  } = useQuery({
    queryKey: schedulingKeys.month(selectedMonthId!),
    queryFn: () => schedulingApi.getMonthById(selectedMonthId!),
    enabled: !!selectedMonthId,
    staleTime: 2 * 60 * 1000,
  })

  // Create month mutation
  const createMonthMutation = useMutation({
    mutationFn: (data: { year: number; month: number }) => schedulingApi.createMonth(data),
    onSuccess: (newMonth) => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.months() })
      setSelectedMonthId(newMonth.id)
      toast.success(tToasts('planningCreated'))
    },
    onError: async (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        await queryClient.invalidateQueries({ queryKey: schedulingKeys.months() })
        const months = await queryClient.fetchQuery({
          queryKey: schedulingKeys.monthsList({ year: selectedYear }),
          queryFn: () => schedulingApi.getAllMonths({ year: selectedYear }),
        })
        const monthNumber = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
        const existingMonth = months?.months.find((m: SchedulingMonth) => m.month === monthNumber)
        if (existingMonth) {
          setSelectedMonthId(existingMonth.id)
          toast.success(tToasts('monthExists'))
        } else {
          toast.error(tToasts('planningCreateError'))
        }
      } else {
        toast.error(tToasts('planningCreateError'))
      }
    },
  })

  // Update month status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MonthStatus }) =>
      schedulingApi.updateMonth(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.month(selectedMonthId!) })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.months() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.annualTotals(selectedYear) })
      toast.success(tToasts('statusUpdated'))
    },
    onError: () => {
      toast.error(tToasts('statusUpdateError'))
    },
  })

  // Unpublish month mutation
  const unpublishMutation = useMutation({
    mutationFn: (monthId: number) => schedulingApi.unpublishMonth(monthId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.month(selectedMonthId!) })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.months() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.annualTotals(selectedYear) })
      toast.success(tToasts('monthReverted'))
    },
    onError: () => {
      toast.error(tToasts('revertError'))
    },
  })

  // Helper: revalidate schedule after any assignment change
  const revalidateSchedule = useCallback((monthId: number) => {
    setTimeout(async () => {
      try {
        const validationResult = await schedulingApi.validateSchedule(monthId)
        const allWarnings = [...validationResult.errors, ...validationResult.warnings]
        setValidationWarnings(allWarnings.length > 0 ? { warnings: allWarnings } : null)
      } catch {
        console.warn('Failed to revalidate schedule after edit')
      }
    }, 100)
  }, [])

  // Update single assignment mutation (no success toast — cell change is visual feedback enough)
  const updateAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, shiftCode }: { assignmentId: number; shiftCode: string }) =>
      schedulingApi.updateAssignment(assignmentId, { shiftCode }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schedulingKeys.month(selectedMonthId!) })
      setSelectedCell(null)
      if (selectedMonthId) revalidateSchedule(selectedMonthId)
    },
    onError: () => {
      toast.error(tToasts('shiftUpdateError'))
    },
  })

  // Bulk update assignments mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ monthId, assignments }: { monthId: number; assignments: BulkAssignmentDto[] }) =>
      schedulingApi.bulkUpdateAssignments(monthId, assignments),
    onSuccess: async (_, { assignments }) => {
      await queryClient.invalidateQueries({ queryKey: schedulingKeys.month(selectedMonthId!) })
      setBulkSelection(null)
      setSelectedCell(null)
      toast.success(
        `${assignments.length} turno${assignments.length !== 1 ? 's' : ''} actualizados`
      )
      if (selectedMonthId) revalidateSchedule(selectedMonthId)
    },
    onError: () => {
      toast.error(tToasts('shiftUpdateError'))
    },
  })

  const handleCreateMonth = useCallback(
    (month: number) => {
      createMonthMutation.mutate({ year: selectedYear, month })
    },
    [createMonthMutation, selectedYear]
  )

  // Reset month mutation
  const resetMutation = useMutation({
    mutationFn: (monthId: number) => schedulingApi.resetMonth(monthId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.month(selectedMonthId!) })
      toast.success(tToasts('resetSuccess'))
    },
    onError: () => {
      toast.error(tToasts('resetError'))
    },
  })

  const handleReset = useCallback(() => {
    if (selectedMonthId) {
      setConfirmDialog({ open: true, type: 'reset' })
    }
  }, [selectedMonthId])

  const handlePublish = useCallback(() => {
    if (selectedMonthId && monthData?.status === 'draft') {
      updateStatusMutation.mutate({ id: selectedMonthId, status: 'published' })
    }
  }, [updateStatusMutation, selectedMonthId, monthData?.status])

  const handleUnpublish = useCallback(() => {
    if (selectedMonthId && monthData?.status === 'published') {
      unpublishMutation.mutate(selectedMonthId)
    }
  }, [unpublishMutation, selectedMonthId, monthData?.status])

  // Delete month mutation
  const deleteMonthMutation = useMutation({
    mutationFn: (monthId: number) => schedulingApi.deleteMonth(monthId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.months() })
      setSelectedMonthId(null)
      toast.success(tToasts('monthDeleted'))
    },
    onError: () => {
      toast.error(tToasts('monthDeleteError'))
    },
  })

  const handleDeleteMonth = useCallback(() => {
    if (selectedMonthId) {
      setConfirmDialog({ open: true, type: 'delete' })
    }
  }, [selectedMonthId])

  // Handle cell click to open shift selector
  const handleCellClick = useCallback(
    (employeeId: string, dayId: number, currentShift: string | null, event: React.MouseEvent) => {
      if (!monthData) return

      // Find employee info
      const employee = monthData.employees.find((e) => e.id === employeeId)
      if (!employee) return

      // Find the day to get dayNumber
      const day = monthData.days.find((d) => d.id === dayId)
      if (!day) return

      // Get assignment ID if exists
      const assignment = employee.assignments[day.dayNumber]
      const assignmentId = assignment?.id || null

      // Open selector at click position
      setSelectedCell({
        employeeId,
        employeeName: employee.name,
        dayId,
        dayNumber: day.dayNumber,
        assignmentId,
        currentShiftCode: currentShift,
        position: { x: event.clientX, y: event.clientY },
      })
    },
    [monthData]
  )

  // Handle shift selection from selector (single cell)
  const handleShiftSelect = useCallback(
    (shiftCode: string) => {
      if (!selectedCell) {
        setSelectedCell(null)
        return
      }

      if (shiftCode === selectedCell.currentShiftCode) {
        setSelectedCell(null)
        return
      }

      if (!selectedCell.assignmentId) {
        if (!selectedMonthId) return
        bulkUpdateMutation.mutate({
          monthId: selectedMonthId,
          assignments: [
            {
              day_id: selectedCell.dayId,
              employee_id: selectedCell.employeeId,
              shift_code: shiftCode,
            },
          ],
        })
        return
      }

      updateAssignmentMutation.mutate({
        assignmentId: selectedCell.assignmentId,
        shiftCode,
      })
    },
    [selectedCell, selectedMonthId, updateAssignmentMutation, bulkUpdateMutation]
  )

  // Handle bulk cell drag selection from grid
  const handleBulkCellSelect = useCallback((selection: BulkSelection) => {
    setBulkSelection(selection)
  }, [])

  // Handle shift selection for bulk cells
  const handleBulkShiftSelect = useCallback(
    (shiftCode: string) => {
      if (!bulkSelection || !selectedMonthId) {
        setBulkSelection(null)
        return
      }

      const assignments: BulkAssignmentDto[] = bulkSelection.cells.map((cell) => ({
        day_id: cell.dayId,
        employee_id: bulkSelection.employeeId,
        shift_code: shiftCode,
      }))

      if (assignments.length === 0) {
        setBulkSelection(null)
        return
      }

      bulkUpdateMutation.mutate({ monthId: selectedMonthId, assignments })
    },
    [bulkSelection, selectedMonthId, bulkUpdateMutation]
  )

  const getStatusConfig = (status: MonthStatus) => {
    const configs: Record<MonthStatus, { color: string; label: string }> = {
      draft: {
        color:
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        label: tStatus('draft'),
      },

      published: {
        color:
          'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        label: tStatus('published'),
      },
    }
    return configs[status]
  }

  const months = monthsData?.months || []
  const shiftsMap = useMemo(() => {
    const map: Record<string, SchedulingShift> = {}
    shifts.forEach((s) => {
      map[s.code] = s
    })
    return map
  }, [shifts])

  const loading = loadingMonths || loadingMonth

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1800px] space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('page.title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {t('page.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              disabled={!selectedMonthId || loading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {tActions('refresh')}
            </button>
            <Link
              href="/dashboard/scheduling/config"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FiSettings className="w-3.5 h-3.5" />
              {tActions('configButton')}
            </Link>
          </div>
        </div>

        {/* Month Selector & Actions */}
        <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <MonthSelector
              months={months}
              selectedMonthId={selectedMonthId}
              selectedYear={selectedYear}
              onSelectMonth={setSelectedMonthId}
              onSelectYear={setSelectedYear}
              onCreateMonth={handleCreateMonth}
              loading={loadingMonths}
            />

            {monthData && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusConfig(monthData.status).color} shrink-0`}
                >
                  {getStatusConfig(monthData.status).label}
                </span>

                {/* Action Buttons - Wrapped container for mobile */}
                <div className="flex flex-wrap items-center gap-2">
                  {monthData.status === 'draft' && (
                    <>
                      <button
                        onClick={() => setShowHolidaysModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-md border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap"
                      >
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{tActions('manageHolidays')}</span>
                        <span className="sm:hidden">{tActions('manageHolidaysShort')}</span>
                      </button>
                      <button
                        onClick={handleReset}
                        disabled={resetMutation.isPending}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-md border border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        <FiRotateCcw className="w-3.5 h-3.5" />
                        {resetMutation.isPending ? tActions('resetting') : tActions('reset')}
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs font-medium rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        <FiCheck className="w-3.5 h-3.5" />
                        {tActions('publish')}
                      </button>
                    </>
                  )}

                  {monthData.status === 'published' && (
                    <>
                      <button
                        onClick={handleUnpublish}
                        disabled={unpublishMutation.isPending}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-md border border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        <FiRotateCcw className="w-3.5 h-3.5" />
                        {unpublishMutation.isPending
                          ? tActions('reverting')
                          : tActions('unpublish')}
                      </button>
                      <button
                        onClick={() => monthData && downloadSchedulePdf(monthData)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{tActions('exportPdf')}</span>
                        <span className="sm:hidden">PDF</span>
                      </button>
                    </>
                  )}

                  {/* Delete Month Button */}
                  <button
                    onClick={handleDeleteMonth}
                    disabled={deleteMonthMutation.isPending}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-700 dark:text-red-400 text-xs font-medium rounded-md border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {deleteMonthMutation.isPending ? tActions('deleting') : tActions('delete')}
                    </span>
                    <span className="sm:hidden">Eliminar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!selectedMonthId ? (
          <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiCalendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {tMessages('selectMonth')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              {tMessages('selectMonthHint')}
            </p>
          </div>
        ) : loadingMonth ? (
          <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              {tMessages('loadingData')}
            </p>
          </div>
        ) : monthData ? (
          <div className="space-y-4">
            {/* Validation Warnings */}
            {validationWarnings && validationWarnings.warnings.length > 0 && (
              <ValidationWarnings
                warnings={validationWarnings.warnings}
                onDismiss={() => setValidationWarnings(null)}
              />
            )}

            {/* Stats Summary */}
            <ScheduleStats monthData={monthData} />

            {/* Month Info Panel */}
            <MonthInfoPanel monthId={selectedMonthId!} />

            {/* Shift Legend */}
            <ShiftLegend shifts={shifts} />

            {/* Schedule Grid */}
            <ScheduleGrid
              monthData={monthData}
              shiftsMap={shiftsMap}
              onCellClick={handleCellClick}
              onBulkCellSelect={handleBulkCellSelect}
              editable={monthData.status !== 'published'}
            />
          </div>
        ) : null}

        {/* Shift Selector — single cell */}
        {selectedCell && (
          <ShiftSelector
            shifts={shifts}
            currentShiftCode={selectedCell.currentShiftCode}
            employeeName={selectedCell.employeeName}
            dayNumber={selectedCell.dayNumber}
            position={selectedCell.position}
            onSelect={handleShiftSelect}
            onClose={() => setSelectedCell(null)}
            isLoading={updateAssignmentMutation.isPending}
          />
        )}

        {/* Shift Selector — bulk multi-cell drag selection */}
        {bulkSelection && (
          <ShiftSelector
            shifts={shifts}
            currentShiftCode={null}
            employeeName={bulkSelection.employeeName}
            subtitle={`${bulkSelection.cells.length} días seleccionados`}
            position={bulkSelection.position}
            onSelect={handleBulkShiftSelect}
            onClose={() => setBulkSelection(null)}
            isLoading={bulkUpdateMutation.isPending}
          />
        )}

        {/* Confirm dialogs */}
        <ConfirmDialog
          isOpen={confirmDialog.open && confirmDialog.type === 'reset'}
          onClose={() => setConfirmDialog({ open: false, type: null })}
          onConfirm={() => {
            setConfirmDialog({ open: false, type: null })
            resetMutation.mutate(selectedMonthId!)
          }}
          title={tActions('reset')}
          message={tActions('resetConfirm')}
          confirmText={tActions('reset')}
          variant="warning"
          isLoading={resetMutation.isPending}
        />
        <ConfirmDialog
          isOpen={confirmDialog.open && confirmDialog.type === 'delete'}
          onClose={() => setConfirmDialog({ open: false, type: null })}
          onConfirm={() => {
            setConfirmDialog({ open: false, type: null })
            deleteMonthMutation.mutate(selectedMonthId!)
          }}
          title={tActions('delete')}
          message={tActions('deleteMonthConfirm')}
          details={[
            tActions('deleteMonthDetail1'),
            tActions('deleteMonthDetail2'),
            tActions('deleteMonthDetail3'),
            tActions('deleteMonthDetail4'),
          ]}
          confirmText={tActions('delete')}
          variant="danger"
          isLoading={deleteMonthMutation.isPending}
        />

        {/* Holidays Modal */}
        {showHolidaysModal && monthData && (
          <ManageHolidaysModal
            monthId={monthData.id}
            year={monthData.year}
            month={monthData.month}
            days={monthData.days}
            onClose={() => setShowHolidaysModal(false)}
          />
        )}
      </div>
    </div>
  )
}
