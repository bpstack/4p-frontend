// app/components/scheduling/SchedulingConfigClient.tsx

'use client'

import { useTranslations } from 'next-intl'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulingApi, schedulingKeys } from '@/app/lib/scheduling'
import type {
  SchedulingConfigMap,
  SchedulingShift,
  SchedulingEmployeeRule,
  CreateEmployeeRuleDto,
  UpdateEmployeeRuleDto,
  EmployeeRuleType,
  CreateShiftDto,
  UpdateShiftDto,
  UpdateConstraintDto,
  SchedulingConstraint,
} from '@/app/lib/scheduling'
import { getShiftClasses } from '@/app/lib/scheduling'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ApiError } from '@/app/lib/apiClient'
import DatePickerInput from '@/app/ui/calendar/DatePickerInput'
import {
  FiArrowLeft,
  FiSettings,
  FiUsers,
  FiCalendar,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiEdit,
  FiX,
  FiCheck,
  FiUserCheck,
  FiCalendar as FiCalendarOff,
  FiBarChart2,
} from 'react-icons/fi'
import { EmployeeTotals } from './EmployeeTotals'
import { ConfirmDialog } from '@/app/ui/panels/ConfirmDialog'

import 'react-day-picker/style.css'

type TabType = 'employees' | 'totals' | 'general' | 'rules' | 'requests'

const VALID_TABS: TabType[] = ['employees', 'totals', 'general', 'rules', 'requests']

function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface Employee {
  id: string
  username: string
}

export function SchedulingConfigClient() {
  const t = useTranslations('scheduling')
  const tConfig = useTranslations('scheduling.config')
  const tMessages = useTranslations('scheduling.messages')
  const _queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get active tab from URL, default to 'employees'
  const tabParam = searchParams.get('tab')
  const activeTab: TabType = VALID_TABS.includes(tabParam as TabType)
    ? (tabParam as TabType)
    : 'employees'

  // Update URL when tab changes
  const setActiveTab = useCallback(
    (tab: TabType) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'employees') {
        params.delete('tab') // Default tab, no need in URL
      } else {
        params.set('tab', tab)
      }
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Fetch configuration
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: schedulingKeys.configMap(),
    queryFn: schedulingApi.getConfigMap,
  })

  // Fetch shifts
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: schedulingKeys.shifts(),
    queryFn: schedulingApi.getAllShifts,
  })

  // Fetch employee rules
  const { data: rulesData, isLoading: loadingRules } = useQuery({
    queryKey: schedulingKeys.rules(),
    queryFn: schedulingApi.getAllRules,
  })

  const _rules = rulesData?.rules || []

  const tabs = [
    { id: 'employees' as TabType, label: tConfig('tabs.employees'), icon: FiUserCheck },
    { id: 'totals' as TabType, label: tConfig('tabs.totals'), icon: FiBarChart2 },
    { id: 'general' as TabType, label: tConfig('tabs.general'), icon: FiSettings },
    { id: 'rules' as TabType, label: tConfig('tabs.rules'), icon: FiUsers },
    { id: 'requests' as TabType, label: tConfig('tabs.requests'), icon: FiCalendarOff },
  ]

  const isLoading = loadingConfig || loadingShifts || loadingRules

  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-[1400px] space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/scheduling"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('page.configTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {t('page.configSubtitle')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <nav className="flex gap-1 sm:gap-4 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                {tMessages('loadingConfig')}
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'employees' && <EmployeesTab />}
              {activeTab === 'totals' && <TotalsTab />}
              {activeTab === 'general' && config && (
                <GeneralConfigTab config={config} shifts={shifts} />
              )}
              {activeTab === 'rules' && <RulesTab />}
              {activeTab === 'requests' && <RequestsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// EMPLOYEES TAB
// ============================================

interface EmployeeWithStatus {
  id: string
  username: string
  role_id: number
  is_schedulable: boolean
}

function EmployeesTab() {
  const _t = useTranslations('scheduling')
  const tConfig = useTranslations('scheduling.config')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')
  const tMessages = useTranslations('scheduling.messages')

  const queryClient = useQueryClient()

  // Fetch all employees with their schedulable status
  const { data: employees = [], isLoading } = useQuery<EmployeeWithStatus[]>({
    queryKey: schedulingKeys.employeesAll(),
    queryFn: schedulingApi.getAllEmployeesWithStatus,
  })

  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize selected IDs when data loads
  useEffect(() => {
    if (employees.length > 0 && selectedIds === null) {
      const initialSelected = new Set(employees.filter((e) => e.is_schedulable).map((e) => e.id))
      setSelectedIds(initialSelected)
    }
  }, [employees, selectedIds])

  const currentSelected = selectedIds ?? new Set<string>()

  const toggleEmployee = (id: string) => {
    const newSelected = new Set(currentSelected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    setHasChanges(true)
  }

  const selectAll = () => {
    setSelectedIds(new Set(employees.map((e) => e.id)))
    setHasChanges(true)
  }

  const selectNone = () => {
    setSelectedIds(new Set())
    setHasChanges(true)
  }

  const saveMutation = useMutation({
    mutationFn: (ids: string[]) => schedulingApi.setSchedulableEmployees(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.employeesAll() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.employees() })
      queryClient.invalidateQueries({ queryKey: schedulingKeys.all })
      toast.success(tToasts('employeesUpdated'))
      setHasChanges(false)
    },
    onError: () => {
      toast.error(tToasts('saveError'))
    },
  })

  const handleSave = () => {
    saveMutation.mutate(Array.from(currentSelected))
  }

  if (isLoading || selectedIds === null) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          {tMessages('loadingEmployees')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {tConfig('employees.title')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tConfig('employees.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tConfig('employees.selectedCount', {
              selected: currentSelected.size,
              total: employees.length,
            })}
          </span>
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {tActions('all')}
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={selectNone}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {tActions('none')}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <div>
          {employees.map((employee, index) => (
            <div
              key={employee.id}
              className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                index !== employees.length - 1
                  ? 'border-b border-gray-100 dark:border-gray-800'
                  : ''
              }`}
              onClick={() => toggleEmployee(employee.id)}
            >
              <input
                type="checkbox"
                checked={currentSelected.has(employee.id)}
                onChange={() => toggleEmployee(employee.id)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {employee.username}
                </span>
              </div>
              {!hasChanges &&
                (employee.is_schedulable ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {tConfig('employees.active')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                    {tConfig('employees.excluded')}
                  </span>
                ))}
            </div>
          ))}
        </div>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8">
          <FiUsers className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{tMessages('noEmployees')}</p>
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            {saveMutation.isPending ? tActions('saving') : tActions('save')}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// GENERAL CONFIG TAB
// ============================================

interface GeneralConfigTabProps {
  config: SchedulingConfigMap
  shifts: SchedulingShift[]
}
function GeneralConfigTab({ config, shifts }: GeneralConfigTabProps) {
  const t = useTranslations('scheduling.config.general')
  const tToasts = useTranslations('scheduling.toasts')
  const tActions = useTranslations('scheduling.actions')

  const queryClient = useQueryClient()
  const [editedConfig, setEditedConfig] = useState<Partial<Record<string, string>>>({})
  const [saving, setSaving] = useState(false)

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      schedulingApi.updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.configMap() })
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = Object.entries(editedConfig).map(([key, value]) =>
        updateMutation.mutateAsync({ key, value: value! })
      )
      await Promise.all(promises)
      setEditedConfig({})
      toast.success(tToasts('configSaved'))
    } catch {
      toast.error(tToasts('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.keys(editedConfig).length > 0

  const getValue = (key: string, defaultValue: number) => {
    return editedConfig[key] ?? defaultValue
  }

  const handleChange = (key: string, value: string) => {
    setEditedConfig({ ...editedConfig, [key]: value })
  }

  return (
    <div className="p-4 space-y-6">
      {/* DOTACIÓN POR TURNO */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t('staffingPerShift')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mañana */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                M
              </span>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t('morningShift')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('minimum')}</span>
                <input
                  type="number"
                  value={getValue('min_morning_staff', config.minMorningStaff)}
                  onChange={(e) => handleChange('min_morning_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('preferred')}</span>
                <input
                  type="number"
                  value={getValue('pref_morning_staff', config.prefMorningStaff)}
                  onChange={(e) => handleChange('pref_morning_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('maximum')}</span>
                <input
                  type="number"
                  value={getValue('max_morning_staff', config.maxMorningStaff)}
                  onChange={(e) => handleChange('max_morning_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Tarde */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                T
              </span>
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                {t('afternoonShift')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('minimum')}</span>
                <input
                  type="number"
                  value={getValue('min_afternoon_staff', config.minAfternoonStaff)}
                  onChange={(e) => handleChange('min_afternoon_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('preferred')}</span>
                <input
                  type="number"
                  value={getValue('pref_afternoon_staff', config.prefAfternoonStaff)}
                  onChange={(e) => handleChange('pref_afternoon_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('maximum')}</span>
                <input
                  type="number"
                  value={getValue('max_afternoon_staff', config.maxAfternoonStaff)}
                  onChange={(e) => handleChange('max_afternoon_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Noche */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                N
              </span>
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                {t('nightShift')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('minimum')}</span>
                <input
                  type="number"
                  value={getValue('min_night_staff', config.minNightStaff)}
                  onChange={(e) => handleChange('min_night_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('maximum')}</span>
                <input
                  type="number"
                  value={getValue('max_night_staff', config.maxNightStaff)}
                  onChange={(e) => handleChange('max_night_staff', e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LÍMITES Y RESTRICCIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Limites Semanales */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            {t('weeklyLimits')}
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('maxShiftsPerWeek')}
              </span>
              <input
                type="number"
                value={getValue('max_weekly_shifts', config.maxWeeklyShifts)}
                onChange={(e) => handleChange('max_weekly_shifts', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('preferredShiftsPerWeek')}
              </span>
              <input
                type="number"
                value={getValue('pref_weekly_shifts', config.prefWeeklyShifts)}
                onChange={(e) => handleChange('pref_weekly_shifts', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('minRestHours')}</span>
              <input
                type="number"
                value={getValue('min_rest_hours', config.minRestHours)}
                onChange={(e) => handleChange('min_rest_hours', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Bloques de Noche */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            {t('nightBlocks')}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
            {t('consecutiveNightsAllowed')}
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('minConsecutive')}
              </span>
              <input
                type="number"
                value={getValue('min_night_block', config.minNightBlock)}
                onChange={(e) => handleChange('min_night_block', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('maxConsecutive')}
              </span>
              <input
                type="number"
                value={getValue('max_night_block', config.maxNightBlock)}
                onChange={(e) => handleChange('max_night_block', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('preferred')}</span>
              <input
                type="number"
                value={getValue('pref_night_block', config.prefNightBlock)}
                onChange={(e) => handleChange('pref_night_block', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DÍAS LIBRES Y CONSECUTIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Días libres mensuales */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">
            {t('monthlyFreeDays')}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
            {t('monthlyFreeDaysDesc')}
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('minimum')}</span>
              <input
                type="number"
                value={getValue('min_monthly_libre', config.minMonthlyLibre)}
                onChange={(e) => handleChange('min_monthly_libre', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('maximum')}</span>
              <input
                type="number"
                value={getValue('max_monthly_libre', config.maxMonthlyLibre)}
                onChange={(e) => handleChange('max_monthly_libre', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Días consecutivos de trabajo */}
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-rose-800 dark:text-rose-300 mb-1">
            {t('consecutiveWorkDays')}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
            {t('consecutiveWorkDaysDesc')}
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('maximum')}</span>
              <input
                type="number"
                value={getValue('max_consecutive_work_days', config.maxConsecutiveWorkDays)}
                onChange={(e) => handleChange('max_consecutive_work_days', e.target.value)}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Section */}
      <ShiftsSection shifts={shifts} />

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            {saving ? tActions('saving') : tActions('save')}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// SHIFTS SECTION (within General Config Tab)
// ============================================

interface ShiftsSectionProps {
  shifts: SchedulingShift[]
}

function ShiftsSection({ shifts }: ShiftsSectionProps) {
  const t = useTranslations('scheduling.config.shifts')
  const tToasts = useTranslations('scheduling.toasts')
  const tActions = useTranslations('scheduling.actions')

  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingShift, setEditingShift] = useState<SchedulingShift | null>(null)
  const [deletingShift, setDeletingShift] = useState<SchedulingShift | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (shiftId: number) => schedulingApi.deleteShift(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() })
      setDeletingShift(null)
      toast.success(tToasts('shiftDeleted'))
    },
    onError: () => {
      toast.error(tToasts('shiftDeleteError'))
    },
  })

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-3.5 h-3.5" />
          {tActions('addShift')}
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('code')}
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('name')}
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('schedule')}
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('hours')}
              </th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('work')}
              </th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('paid')}
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr
                key={shift.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-2 px-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold border ${getShiftClasses(shift.code)}`}
                  >
                    {shift.code}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{shift.name}</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                  {shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : '-'}
                </td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{shift.hours}h</td>
                <td className="py-2 px-3 text-center">
                  {shift.isWorkShift ? (
                    <FiCheck className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <FiX className="w-4 h-4 text-gray-400 mx-auto" />
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  {shift.isPaid ? (
                    <FiCheck className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <FiX className="w-4 h-4 text-gray-400 mx-auto" />
                  )}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingShift(shift)}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title={tActions('edit')}
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingShift(shift)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title={tActions('delete')}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shifts.length === 0 && (
        <div className="text-center py-8">
          <FiCalendar className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('noShifts')}</p>
        </div>
      )}

      {/* Add/Edit Shift Modal */}
      {(showAddModal || editingShift) && (
        <ShiftModal
          shift={editingShift}
          onClose={() => {
            setShowAddModal(false)
            setEditingShift(null)
          }}
        />
      )}

      {/* Delete Shift Confirm */}
      <ConfirmDialog
        isOpen={!!deletingShift}
        onClose={() => setDeletingShift(null)}
        onConfirm={() => deletingShift && deleteMutation.mutate(deletingShift.id)}
        title={tActions('delete')}
        message={
          deletingShift
            ? t('deleteConfirm', { name: deletingShift.name, code: deletingShift.code })
            : ''
        }
        confirmText={tActions('delete')}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

// ============================================
// SHIFT MODAL (Create/Edit)
// ============================================

interface ShiftModalProps {
  shift: SchedulingShift | null
  onClose: () => void
}

function ShiftModal({ shift, onClose }: ShiftModalProps) {
  const t = useTranslations('scheduling.config.shifts')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')

  const queryClient = useQueryClient()
  const isEditing = !!shift

  const [code, setCode] = useState(shift?.code || '')
  const [name, setName] = useState(shift?.name || '')
  const [startTime, setStartTime] = useState(shift?.startTime || '')
  const [endTime, setEndTime] = useState(shift?.endTime || '')
  const [hours, setHours] = useState(shift?.hours ? String(shift.hours) : '8')
  const [isWorkShift, setIsWorkShift] = useState(shift?.isWorkShift ?? true)
  const [isPaid, setIsPaid] = useState(shift?.isPaid ?? true)
  const [displayOrder, setDisplayOrder] = useState(
    shift?.displayOrder ? String(shift.displayOrder) : '10'
  )

  const createMutation = useMutation({
    mutationFn: (data: CreateShiftDto) => schedulingApi.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() })
      toast.success(tToasts('shiftCreated'))
      onClose()
    },
    onError: () => {
      toast.error(tToasts('shiftCreateError'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShiftDto }) =>
      schedulingApi.updateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() })
      toast.success(tToasts('shiftUpdated'))
      onClose()
    },
    onError: () => {
      toast.error(tToasts('shiftUpdateError'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!code || !name) {
      toast.error(t('codeNameRequired'))
      return
    }

    const data = {
      code: code.toUpperCase(),
      name,
      startTime: startTime || null,
      endTime: endTime || null,
      hours: parseFloat(hours) || 0,
      isWorkShift,
      isPaid,
      displayOrder: parseInt(displayOrder) || 10,
    }

    if (isEditing && shift) {
      updateMutation.mutate({ id: shift.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#151b23] rounded-lg shadow-xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? t('editShift') : t('newShift')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('code')} *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="M, T, N..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 uppercase"
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('name')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('startTime')}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('endTime')}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('hours')}
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                step="0.25"
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('displayOrder')}
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isWorkShift}
                onChange={(e) => setIsWorkShift(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700"
              />
              {t('isWorkShift')}
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700"
              />
              {t('isPaid')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {tActions('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? tActions('saving') : tActions('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// REQUESTS TAB (Day Off Requests)
// ============================================

function RequestsTab() {
  const t = useTranslations('scheduling.config.requests')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')
  const tMessages = useTranslations('scheduling.messages')

  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState<SchedulingConstraint | null>(null)

  const { data: monthsData } = useQuery({
    queryKey: schedulingKeys.monthsList(),
    queryFn: () => schedulingApi.getAllMonths({ limit: 12 }),
  })

  const months = useMemo(() => monthsData?.months || [], [monthsData?.months])

  const currentYear = new Date().getFullYear()
  const availableYears = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]
  const availableMonths = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ]

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [listMonthId, setListMonthId] = useState<number | null>(null)

  const monthMapping = useMemo(() => {
    const map: Record<string, number> = {}
    months.forEach((m) => {
      const key = `${m.year}-${m.month}`
      map[key] = m.id
    })
    return map
  }, [months])

  const selectedKey = `${selectedYear}-${selectedMonth}`
  const isMonthInitialized = listMonthId !== null

  useEffect(() => {
    const monthId = monthMapping[selectedKey]
    setListMonthId(monthId || null)
  }, [selectedKey, monthMapping])

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['scheduling-requests', listMonthId],
    queryFn: async () => {
      if (!listMonthId) return []
      const constraints = await schedulingApi.getConstraintsByMonth(listMonthId, {})
      return constraints.filter(
        (c) => c.constraintType === 'request_off' || c.constraintType === 'vacation'
      )
    },
    enabled: !!listMonthId,
  })

  const deleteMutation = useMutation({
    mutationFn: (constraintId: number) => schedulingApi.deleteConstraint(constraintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-requests', listMonthId] })
      toast.success(tToasts('requestDeleted'))
    },
    onError: () => {
      toast.error(tToasts('ruleDeleteError'))
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'approved' | 'rejected' }) =>
      schedulingApi.approveConstraint(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-requests', listMonthId] })
      toast.success(tToasts('requestUpdated'))
    },
    onError: () => {
      toast.error(tToasts('ruleUpdateError'))
    },
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('T')[0].split('-')
    return `${d}-${m}-${y.slice(2)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return t('approved')
      case 'rejected':
        return t('rejected')
      default:
        return t('pending')
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 py-1.5 text-xs min-w-[80px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            title={t('newRequest')}
            className={
              `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ` +
              'bg-blue-600 text-white hover:bg-blue-700'
            }
          >
            <FiPlus className="w-3.5 h-3.5" />
            {t('newRequest')}
          </button>
        </div>
      </div>

      {!isMonthInitialized ? (
        <div className="text-center py-12">
          <FiCalendarOff className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tMessages('monthNotInitialized')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {tMessages('monthNotInitializedHint')}
          </p>
        </div>
      ) : loadingRequests ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            {tMessages('loadingRequests')}
          </p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendarOff className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{tMessages('noRequests')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {tMessages('noRequestsHint')}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('employee')}
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('type')}
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('dates')}
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('reasonLabel')}
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('status')}
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                    {request.employeeName}
                  </td>
                  <td className="py-2 px-3">
                    {request.constraintType === 'vacation' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        V
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        L
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                    {formatDate(request.startDate)}
                    {request.startDate !== request.endDate && ` - ${formatDate(request.endDate)}`}
                  </td>
                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                    {request.notes || '-'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              approveMutation.mutate({ id: request.id, status: 'approved' })
                            }
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title={t('approved')}
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              approveMutation.mutate({ id: request.id, status: 'rejected' })
                            }
                            className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                            title={t('rejected')}
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingRequest(request)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title={tActions('edit')}
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(request.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title={tActions('delete')}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <AddRequestModal
          months={months}
          initialMonthId={listMonthId}
          onClose={() => setShowAddForm(false)}
          onMonthResolved={(monthId) => {
            setListMonthId(monthId)
          }}
        />
      )}

      {editingRequest && (
        <EditRequestModal
          request={editingRequest}
          months={months}
          onClose={() => setEditingRequest(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['scheduling-requests', listMonthId] })
            setEditingRequest(null)
          }}
        />
      )}
    </div>
  )
}

// ============================================
// EDIT REQUEST MODAL
// ============================================

interface EditRequestModalProps {
  request: SchedulingConstraint
  months: { id: number; year: number; month: number }[]
  onClose: () => void
  onSuccess: () => void
}

function EditRequestModal({ request, months: _months, onClose, onSuccess }: EditRequestModalProps) {
  const t = useTranslations('scheduling.config.requests')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')

  const [startDate, setStartDate] = useState(() => formatLocalDate(new Date(request.startDate)))
  const [endDate, setEndDate] = useState(() => formatLocalDate(new Date(request.endDate)))
  const [notes, setNotes] = useState(request.notes || '')
  const [isVacation, setIsVacation] = useState(request.constraintType === 'vacation')

  const updateMutation = useMutation({
    mutationFn: (data: {
      constraintId: number
      constraintType: string
      startDate: string
      endDate: string
      notes?: string
    }) => {
      const { constraintId, ...rest } = data
      return schedulingApi.updateConstraint(constraintId, rest as UpdateConstraintDto)
    },
    onSuccess: () => {
      toast.success(tToasts('requestUpdated'))
      onSuccess()
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toast.error(err.message)
        return
      }
      if (err instanceof Error) {
        toast.error(err.message)
        return
      }
      toast.error(tToasts('requestUpdateError'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) {
      toast.error(t('completeRequired'))
      return
    }
    updateMutation.mutate({
      constraintId: request.id,
      constraintType: isVacation ? 'vacation' : 'request_off',
      startDate,
      endDate: endDate || startDate,
      notes: notes || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#151b23] rounded-lg shadow-xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {tActions('edit')} {t('newRequest')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('employee')}
            </label>
            <input
              type="text"
              value={request.employeeName}
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-[#0b0f14] text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerInput
              label={`${t('from')} *`}
              value={startDate}
              onChange={(v) => {
                const val = v || ''
                setStartDate(val)
                if (val && endDate && val > endDate) setEndDate(val)
              }}
              clearable={false}
            />
            <DatePickerInput
              label={t('until')}
              value={endDate || startDate}
              onChange={(v) => setEndDate(v || startDate)}
              minDate={startDate ? new Date(startDate + 'T12:00:00') : null}
              clearable={false}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reason')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              maxLength={46}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {notes.length}/46 caracteres
            </p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVacation}
              onChange={(e) => setIsVacation(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                V
              </span>
              {t('vacationRequest')}
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {tActions('cancel')}
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? tActions('saving') : tActions('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// ADD REQUEST MODAL
// ============================================

interface AddRequestModalProps {
  months: { id: number; year: number; month: number }[]
  initialMonthId: number | null
  onClose: () => void
  onMonthResolved: (monthId: number) => void
}

function AddRequestModal({
  months,
  initialMonthId,
  onClose,
  onMonthResolved,
}: AddRequestModalProps) {
  const t = useTranslations('scheduling.config.requests')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')
  const _tMessages = useTranslations('scheduling.messages')

  const queryClient = useQueryClient()
  const [monthId, setMonthId] = useState<number | null>(initialMonthId)
  const [employeeId, setEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isVacation, setIsVacation] = useState(false)

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: schedulingKeys.employees(),
    queryFn: schedulingApi.getSchedulableEmployees,
  })

  const { data: _monthData } = useQuery({
    queryKey: schedulingKeys.month(monthId || 0),
    queryFn: () => schedulingApi.getMonthById(monthId as number),
    enabled: !!monthId,
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      monthId: number
      employeeId: string
      constraintType: string
      startDate: string
      endDate: string
      notes?: string
    }) =>
      schedulingApi.createConstraint(data as Parameters<typeof schedulingApi.createConstraint>[0]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-requests'] })
      toast.success(tToasts('requestCreated'))
      onClose()
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toast.error(err.message)
        return
      }
      if (err instanceof Error) {
        toast.error(err.message)
        return
      }
      toast.error(tToasts('requestCreateError'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!monthId || !employeeId || !startDate) {
      toast.error(t('completeRequired'))
      return
    }
    createMutation.mutate({
      monthId,
      employeeId,
      constraintType: isVacation ? 'vacation' : 'request_off',
      startDate,
      endDate: endDate || startDate,
      notes: notes || undefined,
    })
  }

  const ensureMonthForDate = async (dateStr: string): Promise<number> => {
    const [yStr, mStr] = dateStr.split('-')
    const y = Number(yStr)
    const m = Number(mStr)

    const existing = months.find((x) => x.year === y && x.month === m)
    if (existing) return existing.id

    try {
      const created = await schedulingApi.createMonth({ year: y, month: m })
      return created.id
    } catch (err) {
      // If already exists (409) or race, refetch list and try to resolve again
      const refreshed = await schedulingApi.getAllMonths({ limit: 24 })
      const found = refreshed.months.find((x) => x.year === y && x.month === m)
      if (found) return found.id
      throw err
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#151b23] rounded-lg shadow-xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('newRequest')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('employee')} *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">{t('selectEmployee')}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.username}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerInput
              label={`${t('from')} *`}
              value={startDate}
              onChange={(v) => {
                const val = v || ''
                setStartDate(val)
                if (val && endDate && val > endDate) setEndDate(val)
                if (val) {
                  void (async () => {
                    const resolvedMonthId = await ensureMonthForDate(val)
                    setMonthId(resolvedMonthId)
                    onMonthResolved(resolvedMonthId)
                  })()
                }
              }}
              clearable={false}
            />
            <DatePickerInput
              label={t('until')}
              value={endDate || startDate}
              onChange={(v) => setEndDate(v || startDate)}
              minDate={startDate ? new Date(startDate + 'T12:00:00') : null}
              clearable={false}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reason')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              maxLength={46}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {notes.length}/46 caracteres
            </p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVacation}
              onChange={(e) => setIsVacation(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                V
              </span>
              {t('vacationRequest')}
            </span>
          </label>

          <p className="text-xs text-gray-500 dark:text-gray-400">{t('approvedNote')}</p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {tActions('cancel')}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !monthId}
              className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? tActions('saving') : tActions('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// TOTALS TAB
// ============================================

function TotalsTab() {
  const t = useTranslations('scheduling.config.totals')

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">{t('year')}</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-28 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <EmployeeTotals year={selectedYear} />
    </div>
  )
}

// ============================================
// RULES TAB
// ============================================

const RULE_TYPE_OPTIONS: { value: EmployeeRuleType; label: string; description: string }[] = [
  {
    value: 'shift_priority',
    label: 'Turno preferido',
    description: 'Turno preferido del empleado (M, T, N)',
  },
  { value: 'fixed_shift', label: 'Turno fijo', description: 'Siempre el mismo turno' },
  {
    value: 'fixed_days',
    label: 'Días fijos',
    description: 'Días específicos de la semana (1=Lun, 7=Dom)',
  },
  {
    value: 'no_weekends',
    label: 'Sin fines de semana',
    description: 'No trabaja sábados ni domingos',
  },
  {
    value: 'max_shift_per_month',
    label: 'Máx. turnos/mes',
    description: 'Máximo número de turnos por mes',
  },
  {
    value: 'min_shift_per_month',
    label: 'Mín. turnos/mes',
    description: 'Mínimo número de turnos por mes',
  },
]

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function RulesTab() {
  const t = useTranslations('scheduling.config.rules')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')
  const tMessages = useTranslations('scheduling.messages')

  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRule, setEditingRule] = useState<SchedulingEmployeeRule | null>(null)
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null)
  const [filterEmployee, setFilterEmployee] = useState<string>('')

  const { data: employees = [], isLoading: loadingEmployees } = useQuery<EmployeeWithStatus[]>({
    queryKey: schedulingKeys.employeesAll(),
    queryFn: schedulingApi.getAllEmployeesWithStatus,
  })

  const { data: rulesData, isLoading: loadingRules } = useQuery({
    queryKey: schedulingKeys.rules(),
    queryFn: async () => schedulingApi.getAllRules(),
    staleTime: 0,
  })

  const rules = rulesData?.rules || []
  const filteredRules = filterEmployee
    ? rules.filter((r) => r.employeeId === filterEmployee)
    : rules

  const getEmployeeName = (employeeId: string, rule?: SchedulingEmployeeRule) => {
    if (rule?.employeeName) return rule.employeeName
    const emp = employees.find((e) => e.id === employeeId)
    return emp?.username || employeeId
  }

  const getRuleTypeLabel = (ruleType: EmployeeRuleType) => {
    const option = RULE_TYPE_OPTIONS.find((o) => o.value === ruleType)
    return option?.label || ruleType
  }

  const formatRuleValueDisplay = (ruleType: EmployeeRuleType, value: string) => {
    switch (ruleType) {
      case 'shift_priority':
        return value === 'M'
          ? 'Mañana (M)'
          : value === 'T'
            ? 'Tarde (T)'
            : value === 'N'
              ? 'Noche (N)'
              : value
      case 'fixed_shift':
        return value === 'M'
          ? 'Mañana (M)'
          : value === 'T'
            ? 'Tarde (T)'
            : value === 'N'
              ? 'Noche (N)'
              : value
      case 'fixed_days':
        return value
          .split(',')
          .map((d) => {
            const dayNum = parseInt(d)
            return DAY_NAMES[dayNum] || d
          })
          .join(', ')
      case 'no_weekends':
        return value === 'true' ? 'Sí' : 'No'
      case 'max_shift_per_month':
      case 'min_shift_per_month':
        return `${value} turnos`
      default:
        return value
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (ruleId: number) => schedulingApi.deleteRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rules() })
      setDeletingRuleId(null)
      toast.success(tToasts('ruleDeleted'))
    },
    onError: () => {
      toast.error(tToasts('ruleDeleteError'))
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ ruleId, isActive }: { ruleId: number; isActive: boolean }) =>
      schedulingApi.updateRule(ruleId, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rules() })
      toast.success(tToasts('ruleUpdated'))
    },
    onError: () => {
      toast.error(tToasts('ruleUpdateError'))
    },
  })

  const isLoading = loadingEmployees || loadingRules

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">{t('allEmployees')}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.username}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-3.5 h-3.5" />
            {t('addRule')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            {tMessages('loadingRules')}
          </p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-12">
          <FiUsers className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{tMessages('noRules')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {tMessages('noRulesHint')}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('employee')}
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('ruleType')}
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('value')}
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('priority')}
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('status')}
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                    {getEmployeeName(rule.employeeId, rule)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {getRuleTypeLabel(rule.ruleType)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                    {formatRuleValueDisplay(rule.ruleType, rule.ruleValue)}
                  </td>
                  <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">
                    {rule.priority}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({ ruleId: rule.id, isActive: !rule.isActive })
                      }
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        rule.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                      }`}
                    >
                      {rule.isActive ? t('active') : t('inactive')}
                    </button>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title={tActions('edit')}
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingRuleId(rule.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title={tActions('delete')}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || editingRule) && (
        <RuleModal
          rule={editingRule}
          employees={employees}
          onClose={() => {
            setShowAddModal(false)
            setEditingRule(null)
          }}
        />
      )}

      {/* Delete Rule Confirm */}
      <ConfirmDialog
        isOpen={deletingRuleId !== null}
        onClose={() => setDeletingRuleId(null)}
        onConfirm={() => deletingRuleId !== null && deleteMutation.mutate(deletingRuleId)}
        title={tActions('delete')}
        message={t('deleteConfirm')}
        confirmText={tActions('delete')}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

// ============================================
// RULE MODAL (Create/Edit)
// ============================================

interface RuleModalProps {
  rule: SchedulingEmployeeRule | null
  employees: EmployeeWithStatus[]
  onClose: () => void
}

function RuleModal({ rule, employees, onClose }: RuleModalProps) {
  const t = useTranslations('scheduling.config.rules')
  const tActions = useTranslations('scheduling.actions')
  const tToasts = useTranslations('scheduling.toasts')

  const queryClient = useQueryClient()
  const isEditing = !!rule

  const [employeeId, setEmployeeId] = useState(rule?.employeeId || '')
  const [ruleType, setRuleType] = useState<EmployeeRuleType>(
    (rule?.ruleType as EmployeeRuleType) || 'shift_priority'
  )
  const [ruleValue, setRuleValue] = useState(rule?.ruleValue || '')
  const [priority, setPriority] = useState(String(rule?.priority || 0))
  const [isActive, setIsActive] = useState(rule?.isActive ?? true)
  const [notes, setNotes] = useState(rule?.notes || '')

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRuleDto) => schedulingApi.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rules() })
      toast.success(tToasts('ruleCreated'))
      onClose()
    },
    onError: () => {
      toast.error(tToasts('ruleCreateError'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: number; data: UpdateEmployeeRuleDto }) => {
      const snakeData = {
        ...data,
        rule_type: data.ruleType,
        rule_value: data.ruleValue,
        is_active: data.isActive,
      }
      delete snakeData.ruleType
      delete snakeData.ruleValue
      return schedulingApi.updateRule(ruleId, snakeData as unknown as UpdateEmployeeRuleDto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rules() })
      toast.success(tToasts('ruleUpdated'))
      onClose()
    },
    onError: () => {
      toast.error(tToasts('ruleUpdateError'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId || !ruleType || !ruleValue) {
      toast.error(t('fillRequired'))
      return
    }

    const data = {
      employee_id: employeeId,
      rule_type: ruleType,
      rule_value: ruleValue,
      priority: parseInt(priority) || 0,
      is_active: isActive,
      notes: notes || null,
    }

    if (isEditing && rule) {
      updateMutation.mutate({ ruleId: rule.id, data })
    } else {
      createMutation.mutate(data as unknown as CreateEmployeeRuleDto)
    }
  }

  const getValueInputForType = () => {
    switch (ruleType) {
      case 'shift_priority':
      case 'fixed_shift':
        return (
          <div className="flex gap-2">
            {['M', 'T', 'N'].map((shift) => (
              <button
                key={shift}
                type="button"
                onClick={() => setRuleValue(shift)}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  ruleValue === shift
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {shift === 'M' ? 'Mañana' : shift === 'T' ? 'Tarde' : 'Noche'}
              </button>
            ))}
          </div>
        )
      case 'fixed_days':
        return (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const current = ruleValue ? ruleValue.split(',').filter(Boolean) : []
                  if (current.includes(String(day))) {
                    setRuleValue(current.filter((d) => d !== String(day)).join(','))
                  } else {
                    setRuleValue([...current, day].sort().join(','))
                  }
                }}
                className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  ruleValue.split(',').includes(String(day))
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {DAY_NAMES[day].slice(0, 3)}
              </button>
            ))}
          </div>
        )
      case 'no_weekends':
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRuleValue('true')}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                ruleValue === 'true'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('yes')}
            </button>
            <button
              type="button"
              onClick={() => setRuleValue('false')}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                ruleValue === 'false'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('no')}
            </button>
          </div>
        )
      case 'max_shift_per_month':
      case 'min_shift_per_month':
        return (
          <input
            type="number"
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
            min="0"
            max="31"
            className="w-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
            placeholder="0"
          />
        )
      default:
        return (
          <input
            type="text"
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
          />
        )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#151b23] rounded-lg shadow-xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? t('editRule') : t('newRule')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('employee')} *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={isEditing}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 disabled:opacity-50"
              required
            >
              <option value="">{t('selectEmployee')}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('ruleType')} *
            </label>
            <select
              value={ruleType}
              onChange={(e) => {
                setRuleType(e.target.value as EmployeeRuleType)
                setRuleValue('')
              }}
              disabled={isEditing}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 disabled:opacity-50"
              required
            >
              {RULE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              {RULE_TYPE_OPTIONS.find((o) => o.value === ruleType)?.description}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('value')} *
            </label>
            {getValueInputForType()}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('priority')}
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min="0"
                max="10"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                {t('active')}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {tActions('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending || !employeeId || !ruleType || !ruleValue}
              className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? tActions('saving') : tActions('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// HELPERS
// ============================================

function _formatRuleValue(ruleType: EmployeeRuleType, value: string): string {
  switch (ruleType) {
    case 'shift_priority':
      return value === 'M' ? 'Mañana' : value === 'T' ? 'Tarde' : value
    case 'fixed_days': {
      const dayNames = ['', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
      return value
        .split(',')
        .map((d) => dayNames[parseInt(d)] || d)
        .join(', ')
    }
    case 'no_weekends':
      return value === 'true' ? 'Sí' : 'No'
    case 'max_shift_per_month':
    case 'min_shift_per_month': {
      const [shift, count] = value.split(':')
      return `${shift}: ${count} turnos`
    }
    default:
      return value
  }
}
