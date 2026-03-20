// app/lib/scheduling/queries.ts

import apiClient from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  SchedulingConfig,
  SchedulingConfigMap,
  SchedulingShift,
  SchedulingMonth,
  SchedulingMonthFull,
  SchedulingConstraint,
  SchedulingEmployeeRule,
  SchedulingHistory,
  CreateMonthDto,
  UpdateMonthDto,
  UpdateDayDto,
  UpdateAssignmentDto,
  BulkAssignmentDto,
  CreateConstraintDto,
  UpdateConstraintDto,
  ApproveConstraintDto,
  CreateEmployeeRuleDto,
  UpdateEmployeeRuleDto,
  CreateShiftDto,
  UpdateShiftDto,
  ValidationResult,
  EmployeeContract,
  CreateContractDto,
  UpdateContractDto,
  AnnualTotalsResponse,
} from './types'

const API_URL = API_BASE_URL

// ============================================
// QUERY KEYS (for React Query)
// ============================================

export const schedulingKeys = {
  all: ['scheduling'] as const,
  config: () => [...schedulingKeys.all, 'config'] as const,
  configMap: () => [...schedulingKeys.all, 'config', 'map'] as const,
  shifts: () => [...schedulingKeys.all, 'shifts'] as const,
  shift: (id: number) => [...schedulingKeys.shifts(), id] as const,
  months: () => [...schedulingKeys.all, 'months'] as const,
  monthsList: (filters?: { year?: number; status?: string }) =>
    [...schedulingKeys.months(), 'list', filters] as const,
  month: (id: number) => [...schedulingKeys.months(), id] as const,
  monthInfo: (id: number) => [...schedulingKeys.months(), id, 'info'] as const,
  monthValidation: (id: number) => [...schedulingKeys.months(), id, 'validation'] as const,
  constraints: (monthId: number) => [...schedulingKeys.all, 'constraints', monthId] as const,
  rules: () => [...schedulingKeys.all, 'rules'] as const,
  rulesByEmployee: (employeeId: string) => [...schedulingKeys.rules(), employeeId] as const,
  history: (monthId: number) => [...schedulingKeys.all, 'history', monthId] as const,
  employees: () => [...schedulingKeys.all, 'employees'] as const,
  employeesAll: () => [...schedulingKeys.all, 'employees', 'all'] as const,
  contracts: (year: number) => [...schedulingKeys.all, 'contracts', year] as const,
  contractByEmployee: (year: number, employeeId: string) =>
    [...schedulingKeys.contracts(year), employeeId] as const,
  annualTotals: (year: number) => [...schedulingKeys.all, 'totals', year] as const,
}

// ============================================
// API FUNCTIONS
// ============================================

export const schedulingApi = {
  // ============================================
  // CONFIG
  // ============================================

  /**
   * Get all configuration entries
   */
  getAllConfig: async (): Promise<SchedulingConfig[]> => {
    return apiClient.get(`${API_URL}/api/scheduling/config`)
  },

  /**
   * Get configuration as a typed map
   */
  getConfigMap: async (): Promise<SchedulingConfigMap> => {
    return apiClient.get(`${API_URL}/api/scheduling/config/map`)
  },

  /**
   * Update a configuration value
   */
  updateConfig: async (key: string, value: string): Promise<{ success: boolean }> => {
    return apiClient.put(`${API_URL}/api/scheduling/config/${key}`, { config_value: value })
  },

  // ============================================
  // SHIFTS
  // ============================================

  /**
   * Get all shift types
   */
  getAllShifts: async (): Promise<SchedulingShift[]> => {
    return apiClient.get(`${API_URL}/api/scheduling/shifts`)
  },

  /**
   * Get a single shift by ID
   */
  getShiftById: async (id: number): Promise<SchedulingShift> => {
    return apiClient.get(`${API_URL}/api/scheduling/shifts/${id}`)
  },

  /**
   * Create a new shift
   */
  createShift: async (data: CreateShiftDto): Promise<{ id: number; message: string }> => {
    return apiClient.post(`${API_URL}/api/scheduling/shifts`, data)
  },

  /**
   * Update a shift
   */
  updateShift: async (id: number, data: UpdateShiftDto): Promise<{ message: string }> => {
    return apiClient.put(`${API_URL}/api/scheduling/shifts/${id}`, data)
  },

  /**
   * Delete a shift (soft delete - sets is_active = false)
   */
  deleteShift: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`${API_URL}/api/scheduling/shifts/${id}`)
  },

  // ============================================
  // MONTHS
  // ============================================

  /**
   * Get all months with optional filters
   */
  getAllMonths: async (filters?: {
    year?: number
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ months: SchedulingMonth[]; total: number }> => {
    const query = new URLSearchParams()
    if (filters?.year) query.append('year', String(filters.year))
    if (filters?.status) query.append('status', filters.status)
    if (filters?.limit) query.append('limit', String(filters.limit))
    if (filters?.offset) query.append('offset', String(filters.offset))
    const queryString = query.toString()
    return apiClient.get(`${API_URL}/api/scheduling/months${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get a single month with full data (days, employees, assignments)
   */
  getMonthById: async (id: number): Promise<SchedulingMonthFull> => {
    return apiClient.get(`${API_URL}/api/scheduling/months/${id}`)
  },

  /**
   * Get month info: rules and approved requests
   */
  getMonthInfo: async (
    id: number
  ): Promise<{
    month: { id: number; year: number; month: number; status: string }
    requests: Array<{
      id: number
      employeeId: string
      employeeName: string
      type: string
      typeLabel: string
      startDate: string
      endDate: string
      shiftCode: string | null
      notes: string | null
    }>
    employeeRules: Array<{
      employeeId: string
      employeeName: string
      rules: string[]
    }>
    summary: {
      totalRequests: number
      totalEmployeesWithRules: number
    }
  }> => {
    return apiClient.get(`${API_URL}/api/scheduling/months/${id}/info`)
  },

  /**
   * Create a new month planning
   */
  createMonth: async (data: CreateMonthDto): Promise<SchedulingMonth> => {
    return apiClient.post(`${API_URL}/api/scheduling/months`, data)
  },

  /**
   * Update a month
   */
  updateMonth: async (id: number, data: UpdateMonthDto): Promise<SchedulingMonth> => {
    return apiClient.put(`${API_URL}/api/scheduling/months/${id}`, data)
  },

  /**
   * Delete a month
   */
  deleteMonth: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/scheduling/months/${id}`)
  },

  // ============================================
  // GENERATION
  // ============================================

  /**
   * Reset month - clear all assignments and reload approved constraints
   */
  resetMonth: async (
    monthId: number
  ): Promise<{ success: boolean; message: string; assignmentsCount: number }> => {
    return apiClient.post(`${API_URL}/api/scheduling/months/${monthId}/reset`)
  },

  /**
   * Validate schedule and recalculate warnings
   * Used to update warnings after manual edits
   */
  validateSchedule: async (monthId: number): Promise<ValidationResult> => {
    return apiClient.post(`${API_URL}/api/scheduling/months/${monthId}/validate`)
  },

  /**
   * Unpublish a month - revert from 'published' to 'draft' status
   * This allows editing the schedule and re-publishing to update totals
   */
  unpublishMonth: async (
    monthId: number
  ): Promise<{ success: boolean; message: string; month: SchedulingMonth }> => {
    return apiClient.post(`${API_URL}/api/scheduling/months/${monthId}/unpublish`)
  },

  // ============================================
  // DAYS
  // ============================================

  /**
   * Update a day (mark as holiday, add notes, etc.)
   */
  updateDay: async (
    monthId: number,
    dayId: number,
    data: UpdateDayDto
  ): Promise<{ success: boolean }> => {
    return apiClient.put(`${API_URL}/api/scheduling/months/${monthId}/days/${dayId}`, data)
  },

  /**
   * Bulk update days (e.g., mark multiple days as holidays)
   */
  bulkUpdateDays: async (
    monthId: number,
    days: Array<{ day_id: number; is_holiday?: boolean; holiday_name?: string | null }>
  ): Promise<{ success: boolean; message: string; updatedCount: number }> => {
    return apiClient.post(`${API_URL}/api/scheduling/months/${monthId}/days/bulk`, { days })
  },

  // ============================================
  // ASSIGNMENTS
  // ============================================

  /**
   * Update a single assignment
   */
  updateAssignment: async (
    assignmentId: number,
    data: UpdateAssignmentDto
  ): Promise<{ success: boolean }> => {
    // Transform camelCase to snake_case for backend
    const payload = {
      shift_code: data.shiftCode,
      notes: data.notes,
    }
    return apiClient.put(`${API_URL}/api/scheduling/assignments/${assignmentId}`, payload)
  },

  /**
   * Bulk update assignments for a month
   */
  bulkUpdateAssignments: async (
    monthId: number,
    assignments: BulkAssignmentDto[]
  ): Promise<{ success: boolean; count: number }> => {
    return apiClient.put(`${API_URL}/api/scheduling/months/${monthId}/assignments`, { assignments })
  },

  // ============================================
  // CONSTRAINTS
  // ============================================

  /**
   * Get constraints for a month
   */
  getConstraintsByMonth: async (
    monthId: number,
    filters?: { status?: string; employeeId?: string }
  ): Promise<SchedulingConstraint[]> => {
    const query = new URLSearchParams()
    if (filters?.status) query.append('status', filters.status)
    if (filters?.employeeId) query.append('employee_id', filters.employeeId)
    const queryString = query.toString()
    return apiClient.get(
      `${API_URL}/api/scheduling/months/${monthId}/constraints${queryString ? `?${queryString}` : ''}`
    )
  },

  /**
   * Create a constraint (vacation request, etc.)
   */
  createConstraint: async (data: CreateConstraintDto): Promise<SchedulingConstraint> => {
    // Transform camelCase to snake_case for backend
    const payload = {
      month_id: data.monthId,
      employee_id: data.employeeId,
      constraint_type: data.constraintType,
      start_date: data.startDate,
      end_date: data.endDate,
      shift_code: data.shiftCode,
      priority: data.priority,
      notes: data.notes,
    }
    return apiClient.post(`${API_URL}/api/scheduling/constraints`, payload)
  },

  /**
   * Update a constraint
   */
  updateConstraint: async (
    constraintId: number,
    data: UpdateConstraintDto
  ): Promise<SchedulingConstraint> => {
    // Transform camelCase to snake_case for backend
    const payload: Record<string, unknown> = {}
    if (data.constraintType !== undefined) payload.constraint_type = data.constraintType
    if (data.startDate !== undefined) payload.start_date = data.startDate
    if (data.endDate !== undefined) payload.end_date = data.endDate
    if (data.shiftCode !== undefined) payload.shift_code = data.shiftCode
    if (data.priority !== undefined) payload.priority = data.priority
    if (data.notes !== undefined) payload.notes = data.notes
    return apiClient.put(`${API_URL}/api/scheduling/constraints/${constraintId}`, payload)
  },

  /**
   * Approve or reject a constraint
   */
  approveConstraint: async (
    constraintId: number,
    data: ApproveConstraintDto
  ): Promise<SchedulingConstraint> => {
    return apiClient.put(`${API_URL}/api/scheduling/constraints/${constraintId}/approve`, data)
  },

  /**
   * Delete a constraint
   */
  deleteConstraint: async (
    constraintId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/scheduling/constraints/${constraintId}`)
  },

  // ============================================
  // EMPLOYEE RULES
  // ============================================

  /**
   * Get all employee rules
   */
  getAllRules: async (): Promise<{ rules: SchedulingEmployeeRule[]; total: number }> => {
    return apiClient.get(`${API_URL}/api/scheduling/rules`)
  },

  /**
   * Get rules for a specific employee
   */
  getRulesByEmployee: async (
    employeeId: string
  ): Promise<{ rules: SchedulingEmployeeRule[]; total: number }> => {
    return apiClient.get(`${API_URL}/api/scheduling/rules/employee/${employeeId}`)
  },

  /**
   * Create an employee rule
   */
  createRule: async (data: CreateEmployeeRuleDto): Promise<SchedulingEmployeeRule> => {
    return apiClient.post(`${API_URL}/api/scheduling/rules`, data)
  },

  /**
   * Update an employee rule
   */
  updateRule: async (
    ruleId: number,
    data: UpdateEmployeeRuleDto
  ): Promise<SchedulingEmployeeRule> => {
    return apiClient.put(`${API_URL}/api/scheduling/rules/${ruleId}`, data)
  },

  /**
   * Delete an employee rule
   */
  deleteRule: async (ruleId: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/scheduling/rules/${ruleId}`)
  },

  // ============================================
  // HISTORY
  // ============================================

  /**
   * Get history for a month
   */
  getHistory: async (
    monthId: number,
    filters?: { action?: string; limit?: number; offset?: number }
  ): Promise<{ history: SchedulingHistory[]; total: number }> => {
    const query = new URLSearchParams()
    if (filters?.action) query.append('action', filters.action)
    if (filters?.limit) query.append('limit', String(filters.limit))
    if (filters?.offset) query.append('offset', String(filters.offset))
    const queryString = query.toString()
    return apiClient.get(
      `${API_URL}/api/scheduling/months/${monthId}/history${queryString ? `?${queryString}` : ''}`
    )
  },

  // ============================================
  // SCHEDULABLE EMPLOYEES
  // ============================================

  /**
   * Get employees selected for scheduling
   */
  getSchedulableEmployees: async (): Promise<
    { id: string; username: string; role_id: number }[]
  > => {
    return apiClient.get(`${API_URL}/api/scheduling/employees`)
  },

  /**
   * Get all employees with their schedulable status
   */
  getAllEmployeesWithStatus: async (): Promise<
    { id: string; username: string; role_id: number; is_schedulable: boolean }[]
  > => {
    return apiClient.get(`${API_URL}/api/scheduling/employees/all`)
  },

  /**
   * Add employee to scheduling
   */
  addSchedulableEmployee: async (employeeId: string): Promise<{ success: boolean }> => {
    return apiClient.post(`${API_URL}/api/scheduling/employees/${employeeId}`)
  },

  /**
   * Remove employee from scheduling
   */
  removeSchedulableEmployee: async (employeeId: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`${API_URL}/api/scheduling/employees/${employeeId}`)
  },

  /**
   * Set all schedulable employees (replaces list)
   */
  setSchedulableEmployees: async (employeeIds: string[]): Promise<{ success: boolean }> => {
    return apiClient.put(`${API_URL}/api/scheduling/employees`, { employeeIds })
  },

  // ============================================
  // CONTRACTS
  // ============================================

  /**
   * Get all contracts for a year
   */
  getContractsByYear: async (year: number): Promise<EmployeeContract[]> => {
    return apiClient.get(`${API_URL}/api/scheduling/contracts/${year}`)
  },

  /**
   * Get contract for specific employee and year
   */
  getContractByEmployeeYear: async (
    year: number,
    employeeId: string
  ): Promise<EmployeeContract> => {
    return apiClient.get(`${API_URL}/api/scheduling/contracts/${year}/${employeeId}`)
  },

  /**
   * Create a new contract
   */
  createContract: async (data: CreateContractDto): Promise<EmployeeContract> => {
    return apiClient.post(`${API_URL}/api/scheduling/contracts`, data)
  },

  /**
   * Initialize contracts for all schedulable employees for a year
   */
  initializeContractsForYear: async (
    year: number
  ): Promise<{ success: boolean; created: number }> => {
    return apiClient.post(`${API_URL}/api/scheduling/contracts/${year}/initialize`)
  },

  /**
   * Initialize a single contract for an employee with optional start date
   */
  initializeContractForEmployee: async (
    year: number,
    employeeId: string,
    startDate?: string
  ): Promise<{ success: boolean; message: string; contract: EmployeeContract | null }> => {
    return apiClient.post(`${API_URL}/api/scheduling/contracts/${year}/employee/${employeeId}`, {
      startDate,
    })
  },

  /**
   * Calculate proportional contract values (preview without creating)
   */
  calculateProportionalContract: async (
    year: number,
    startDate: string
  ): Promise<{
    year: number
    startDate: string
    values: {
      diasTrabajo: number
      horasAnuales: number
      diasVacaciones: number
      diasLibreSemanal: number
      diasBonificables: number
      diasLaborablesAno: number
    }
  }> => {
    return apiClient.get(
      `${API_URL}/api/scheduling/contracts/${year}/calculate?startDate=${startDate}`
    )
  },

  /**
   * Update a contract
   */
  updateContract: async (
    contractId: number,
    data: UpdateContractDto
  ): Promise<EmployeeContract> => {
    return apiClient.put(`${API_URL}/api/scheduling/contracts/${contractId}`, data)
  },

  /**
   * Delete a contract
   */
  deleteContract: async (contractId: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`${API_URL}/api/scheduling/contracts/${contractId}`)
  },

  // ============================================
  // ANNUAL TOTALS
  // ============================================

  /**
   * Get annual totals for a year (calculated from published months)
   */
  getAnnualTotals: async (year: number): Promise<AnnualTotalsResponse> => {
    return apiClient.get(`${API_URL}/api/scheduling/totals/${year}`)
  },
}
