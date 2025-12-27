// app/components/maintenance/MaintenanceListClient.tsx

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import type { MaintenanceReport, ReportFilters } from '@/app/lib/maintenance/maintenance'
import type { MaintenanceListResponse } from '@/app/lib/maintenance/maintenanceApi'
import { useMaintenanceList, type MaintenanceMessages } from './hooks/useMaintenanceList'
import { CreateReportPanel } from './panels/CreateReportPanel'
import { FiPlus, FiSearch, FiAlertCircle, FiTool, FiCheckCircle, FiClock } from 'react-icons/fi'

interface MaintenanceListClientProps {
  initialReports: MaintenanceReport[]
  initialPagination?: MaintenanceListResponse['pagination']
}

export function MaintenanceListClient({
  initialReports = [],
  initialPagination,
}: MaintenanceListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const panel = searchParams.get('panel')
  const t = useTranslations('maintenance')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  // Memoize messages for the hook
  const messages: MaintenanceMessages = useMemo(
    () => ({
      operationError: tCommon('errors.operationError'),
      reportCreated: t('panels.create.toast.reportCreated'),
      reportUpdated: t('panels.edit.toast.reportUpdated'),
      statusUpdated: t('detail.toast.statusUpdated'),
      priorityUpdated: t('detail.toast.priorityUpdated'),
      reportDeleted: t('detail.toast.reportDeleted'),
      reportRestored: t('panels.edit.toast.reportUpdated'), // Using same as updated for restore
    }),
    [t, tCommon]
  )

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ReportFilters>({
    status: (searchParams.get('status') as ReportFilters['status']) || undefined,
    priority: (searchParams.get('priority') as ReportFilters['priority']) || undefined,
    location_type:
      (searchParams.get('location_type') as ReportFilters['location_type']) || undefined,
    search: searchParams.get('search') || undefined,
  })

  // React Query hook
  const { reports, pagination, isLoading, isFetching, refetch } = useMaintenanceList({
    filters,
    page: currentPage,
    limit: 20,
    initialData: initialPagination
      ? { reports: initialReports, pagination: initialPagination }
      : undefined,
    messages,
  })

  const loading = isLoading || isFetching

  // Actualizar URL con filtros
  const updateUrlWithFilters = useCallback(
    (newFilters: ReportFilters, search?: string) => {
      const params = new URLSearchParams()
      if (newFilters.status) params.set('status', newFilters.status)
      if (newFilters.priority) params.set('priority', newFilters.priority)
      if (newFilters.location_type) params.set('location_type', newFilters.location_type)
      if (search) params.set('search', search)

      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : '/dashboard/maintenance', { scroll: false })
    },
    [router]
  )

  const handleSearch = useCallback(() => {
    const newFilters = { ...filters, search: searchTerm || undefined }
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrlWithFilters(filters, searchTerm)
  }, [filters, searchTerm, updateUrlWithFilters])

  const handleFilterChange = useCallback(
    (newFilters: ReportFilters) => {
      setFilters({ ...newFilters, search: searchTerm || undefined })
      setCurrentPage(1)
      updateUrlWithFilters(newFilters, searchTerm)
    },
    [searchTerm, updateUrlWithFilters]
  )

  const handleCreateReport = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('panel', 'create-report')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleClosePanel = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('panel')
    router.push(`?${params.toString()}`, { scroll: false })
    refetch() // Refetch via React Query
  }, [router, searchParams, refetch])

  const handleViewReport = useCallback(
    (reportId: string) => {
      router.push(`/dashboard/maintenance/${reportId}`)
    },
    [router]
  )

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const getStatusConfig = (status: MaintenanceReport['status']) => {
    const configs = {
      reported: {
        color:
          'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
        label: t('status.reported'),
      },
      assigned: {
        color:
          'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        label: t('status.assigned'),
      },
      in_progress: {
        color:
          'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
        label: t('status.inProgress'),
      },
      waiting: {
        color:
          'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        label: t('status.waiting'),
      },
      completed: {
        color:
          'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        label: t('status.completed'),
      },
      closed: {
        color:
          'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
        label: t('status.closed'),
      },
      canceled: {
        color:
          'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        label: t('status.canceled'),
      },
    }
    return configs[status]
  }

  const getPriorityConfig = (priority: MaintenanceReport['priority']) => {
    const configs = {
      low: {
        color: 'text-gray-600 dark:text-gray-400',
        label: t('priority.low'),
      },
      medium: {
        color: 'text-blue-600 dark:text-blue-400',
        label: t('priority.medium'),
      },
      high: {
        color: 'text-orange-600 dark:text-orange-400',
        label: t('priority.high'),
      },
      urgent: {
        color: 'text-red-600 dark:text-red-400',
        label: t('priority.urgent'),
      },
    }
    return configs[priority]
  }

  const getLocationTypeLabel = (type: MaintenanceReport['location_type']) => {
    const labels = {
      room: t('locationType.room'),
      common_area: t('locationType.commonArea'),
      exterior: t('locationType.exterior'),
      facilities: t('locationType.facilities'),
      other: t('locationType.other'),
    }
    return labels[type]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Stats
  const totalReports = pagination?.total || reports.length
  const urgentReports = reports.filter((r) => r.priority === 'urgent').length
  const inProgressReports = reports.filter((r) => r.status === 'in_progress').length
  const roomsOutOfService = reports.filter((r) => r.room_out_of_service === true).length

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-blue-600 dark:border-blue-500 border-r-transparent"></div>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
        <div className="max-w-[1400px] space-y-5">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t('title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
              <button
                onClick={handleCreateReport}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs font-medium rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
              >
                <FiPlus className="w-3.5 h-3.5" />
                {t('newReport')}
              </button>
            </div>
          </div>

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
                        {t('stats.totalReports')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {totalReports}
                      </p>
                    </div>
                    <FiTool className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.urgent')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {urgentReports}
                      </p>
                    </div>
                    <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.inProgress')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {inProgressReports}
                      </p>
                    </div>
                    <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.roomsOutOfService')}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {roomsOutOfService}
                      </p>
                    </div>
                    <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-4 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder={t('filters.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#151b23] dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-1.5 bg-blue-600 dark:bg-blue-700 text-white text-xs font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? t('filters.searching') : t('filters.search')}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={filters.status || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        status: (e.target.value as ReportFilters['status']) || undefined,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent bg-white dark:bg-[#151b23] dark:text-gray-200"
                  >
                    <option value="">{t('filters.allStatuses')}</option>
                    <option value="reported">{t('status.reported')}</option>
                    <option value="assigned">{t('status.assigned')}</option>
                    <option value="in_progress">{t('status.inProgress')}</option>
                    <option value="waiting">{t('status.waiting')}</option>
                    <option value="completed">{t('status.completed')}</option>
                    <option value="closed">{t('status.closed')}</option>
                    <option value="canceled">{t('status.canceled')}</option>
                  </select>

                  <select
                    value={filters.priority || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        priority: (e.target.value as ReportFilters['priority']) || undefined,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent bg-white dark:bg-[#151b23] dark:text-gray-200"
                  >
                    <option value="">{t('filters.allPriorities')}</option>
                    <option value="low">{t('priority.low')}</option>
                    <option value="medium">{t('priority.medium')}</option>
                    <option value="high">{t('priority.high')}</option>
                    <option value="urgent">{t('priority.urgent')}</option>
                  </select>

                  <select
                    value={filters.location_type || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        location_type:
                          (e.target.value as ReportFilters['location_type']) || undefined,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent bg-white dark:bg-[#151b23] dark:text-gray-200"
                  >
                    <option value="">{t('filters.allLocations')}</option>
                    <option value="room">{t('locationType.room')}</option>
                    <option value="common_area">{t('locationType.commonArea')}</option>
                    <option value="exterior">{t('locationType.exterior')}</option>
                    <option value="facilities">{t('locationType.facilities')}</option>
                    <option value="other">{t('locationType.other')}</option>
                  </select>

                  <button
                    onClick={() => {
                      setFilters({})
                      setSearchTerm('')
                      setCurrentPage(1)
                      router.push('/dashboard/maintenance', { scroll: false })
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('filters.clearFilters')}
                  </button>
                </div>
              </div>

              {/* Table - Desktop */}
              <div className="hidden md:block bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {t('table.date')}
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {t('table.title')}
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {t('table.location')}
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {t('table.priority')}
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {t('table.status')}
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {t('table.assigned')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {reports.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-3 py-8 text-center text-xs text-gray-500 dark:text-gray-400"
                          >
                            {searchTerm ||
                            Object.keys(filters).some((k) => filters[k as keyof ReportFilters])
                              ? t('table.noReportsFound')
                              : t('table.noReports')}
                          </td>
                        </tr>
                      ) : (
                        reports.map((report) => {
                          const statusConfig = getStatusConfig(report.status)
                          const priorityConfig = getPriorityConfig(report.priority)
                          return (
                            <tr
                              key={report.id}
                              onClick={() => handleViewReport(report.id)}
                              className="hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors cursor-pointer"
                            >
                              <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(report.report_date)}
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {report.title}
                                </div>
                                {report.room_out_of_service && (
                                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    {t('table.roomOutOfService')}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-900 dark:text-gray-100">
                                  {getLocationTypeLabel(report.location_type)}
                                  {report.room_number && ` - ${report.room_number}`}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                                  {report.location_description}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-xs font-medium ${priorityConfig.color}`}>
                                  {priorityConfig.label}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.color}`}
                                >
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                                {report.assigned_type === 'external'
                                  ? report.external_company_name
                                  : report.assigned_to
                                    ? t('table.assignedUser')
                                    : '-'}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('pagination.showing', {
                        from: (pagination.page - 1) * pagination.limit + 1,
                        to: Math.min(pagination.page * pagination.limit, pagination.total),
                        total: pagination.total,
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.has_prev || loading}
                        className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('pagination.previous')}
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.has_next || loading}
                        className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('pagination.next')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cards - Mobile */}
              <div className="md:hidden space-y-2">
                {reports.length === 0 ? (
                  <div className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-6 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {searchTerm ||
                      Object.keys(filters).some((k) => filters[k as keyof ReportFilters])
                        ? t('table.noReportsFound')
                        : t('table.noReports')}
                    </p>
                  </div>
                ) : (
                  reports.map((report) => {
                    const statusConfig = getStatusConfig(report.status)
                    const priorityConfig = getPriorityConfig(report.priority)
                    return (
                      <div
                        key={report.id}
                        onClick={() => handleViewReport(report.id)}
                        className="bg-white dark:bg-[#151b23] rounded-md border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                              {report.title}
                            </h3>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                              {getLocationTypeLabel(report.location_type)}
                              {report.room_number && ` - ${report.room_number}`}
                            </p>
                          </div>
                          <span className={`ml-2 text-[10px] font-medium ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2">
                            {report.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-500">
                              {formatDate(report.report_date)}
                            </span>
                          </div>

                          {report.room_out_of_service && (
                            <div className="pt-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                {t('table.roomOutOfService')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Mobile Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_prev || loading}
                      className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
                    >
                      {t('pagination.previous')}
                    </button>
                    <span className="px-4 py-2 text-xs text-gray-500">
                      {pagination.page} / {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next || loading}
                      className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* End Main Content */}

            {/* Right Column - Stats Sidebar (visible on >= 1400px) */}
            <div className="hidden min-[1400px]:block space-y-4">
              <div className="sticky top-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {t('stats.summary')}
                </h3>

                <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.totalReports')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {totalReports}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FiTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.urgent')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {urgentReports}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.inProgress')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {inProgressReports}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <FiClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0D1117] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t('stats.roomsOutOfService')}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {roomsOutOfService}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <FiCheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CreateReportPanel */}
      <CreateReportPanel isOpen={panel === 'create-report'} onClose={handleClosePanel} />
    </>
  )
}
