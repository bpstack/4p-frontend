// app/lib/scheduling/types.ts
// Types for the scheduling module
//
// NOTE: Some types are duplicated between frontend and backend:
// - Backend: backend/models/scheduling/index.ts
// - Frontend: frontend/app/lib/scheduling/types.ts
//
// Duplicated types include:
// - EmployeeStats, EmployeeAnnualTotals, DailyStats, SchedulingConfigMap
// - ConstraintType, EmployeeRuleType, MonthStatus, etc.
//
// TODO: Consider generating frontend types from backend or using a shared package
// to avoid maintenance burden of keeping both in sync.

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type MonthStatus = 'draft' | 'published'

export type ConstraintType =
  | 'vacation'
  | 'sick_leave'
  | 'sick_day'
  | 'training'
  | 'holiday'
  | 'request_off'
  | 'request_shift'
  | 'request_no_shift'

export type ConstraintStatus = 'pending' | 'approved' | 'rejected'

export type EmployeeRuleType =
  | 'shift_priority'
  | 'max_shift_per_month'
  | 'min_shift_per_month'
  | 'fixed_days'
  | 'fixed_shift'
  | 'no_weekends'
  | 'custom'

export type DayOfWeek = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D'

export type HistoryAction =
  | 'created'
  | 'published'
  | 'unpublished'
  | 'assignment_changed'
  | 'constraint_added'
  | 'constraint_approved'
  | 'constraint_rejected'
  | 'manual_edit'
  | 'reset'

// ============================================
// BASE TYPES
// ============================================

export interface SchedulingConfig {
  id: number
  config_key: string
  config_value: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface SchedulingConfigMap {
  minMorningStaff: number
  prefMorningStaff: number
  maxMorningStaff: number
  minAfternoonStaff: number
  prefAfternoonStaff: number
  maxAfternoonStaff: number
  minNightStaff: number
  maxNightStaff: number
  maxWeeklyShifts: number
  prefWeeklyShifts: number
  minRestHours: number
  minNightBlock: number
  maxNightBlock: number
  prefNightBlock: number
  minMonthlyLibre: number
  maxMonthlyLibre: number
  maxConsecutiveWorkDays: number
  annualVacationDays: number
  annualHolidays: number
  annualFreeDays: number
}

export interface SchedulingShift {
  id: number
  code: string
  name: string
  startTime: string | null
  endTime: string | null
  hours: string
  color: string
  isWorkShift: boolean
  isPaid: boolean
  displayOrder: number
  isActive: boolean
}

export interface SchedulingDay {
  id: number
  dayNumber: number
  date: string
  dayOfWeek: DayOfWeek
  weekNumber: number
  isHoliday: boolean
  holidayName: string | null
  occupancyPct: number | null
  arrivals: number | null
  departures: number | null
  notes: string | null
}

export interface SchedulingAssignment {
  id: number
  dayId: number
  employeeId: string
  employeeName: string
  shiftCode: string
  notes: string | null
}

export interface SchedulingConstraint {
  id: number
  monthId: number
  employeeId: string
  employeeName: string
  constraintType: ConstraintType
  startDate: string
  endDate: string
  shiftCode: string | null
  status: ConstraintStatus
  priority: number
  notes: string | null
  createdBy: string | null
  createdByName: string | null
  approvedBy: string | null
  approvedByName: string | null
  approvedAt: string | null
  createdAt: string
}

export interface SchedulingEmployeeRule {
  id: number
  employeeId: string
  employeeName: string
  ruleType: EmployeeRuleType
  ruleValue: string
  priority: number
  isActive: boolean
  notes: string | null
  createdAt: string
}

export interface SchedulingHistory {
  id: number
  monthId: number
  action: HistoryAction
  tableAffected: string | null
  recordId: number | null
  fieldChanged: string | null
  oldValue: string | null
  newValue: string | null
  changedBy: string | null
  changedByName: string | null
  changedAt: string
  notes: string | null
}

// ============================================
// EMPLOYEE WITH ASSIGNMENTS (for grid display)
// ============================================
export interface EmployeeSchedule {
  id: string
  name: string
  assignments: {
    [dayNumber: number]: {
      id: number
      shiftCode: string
      sourceConstraintId?: number | null
      notes: string | null
      libreNumber?: number | null
    }
  }
  stats: EmployeeStats
}

export interface EmployeeStats {
  L: number
  V: number
  B: number
  E: number
  IT: number
  M: number
  T: number
  N: number
  PI: number
  P: number
  FO: number
  A: number
  presencias: number
  horas: number
}

export interface DailyStats {
  day: number
  M: number
  T: number
  N: number
  PI: number
  P: number
}

// ============================================
// MONTH WITH FULL DATA
// ============================================

export interface SchedulingMonth {
  id: number
  year: number
  month: number
  status: MonthStatus
  publishedAt: string | null
  publishedBy: string | null
  publishedByName?: string | null
  notes: string | null
  createdBy: string | null
  createdByName?: string | null
  createdAt: string
  updatedAt: string
}

export interface SchedulingMonthFull extends SchedulingMonth {
  days: SchedulingDay[]
  employees: EmployeeSchedule[]
  dailyStats: DailyStats[]
  constraints: SchedulingConstraint[]
}

// ============================================
// GENERATION RESULT
// ============================================

/**
 * Warning/error severity levels
 * Synced from: backend/services/scheduling/types/index.ts
 */
export type WarningSeverity = 'info' | 'warning' | 'error'

/**
 * Warning/error types for categorization
 * Synced from: backend/services/scheduling/types/index.ts
 */
export type WarningType =
  | 'coverage'
  | 'night_block'
  | 'rest'
  | 'hours'
  | 'constraint'
  | 'validation'

export interface GenerationWarning {
  type: WarningType
  severity: WarningSeverity
  message: string
  day?: number
  employeeId?: string
  employeeName?: string
}

export interface GenerationResult {
  success: boolean
  monthId: number
  assignmentsCount: number
  generationTimeMs: number
  warnings: GenerationWarning[]
  stats: {
    byEmployee: EmployeeStats[]
    byDay: DailyStats[]
  }
}

// ============================================
// VALIDATION RESULT
// ============================================

export interface ValidationResult {
  isValid: boolean
  errors: GenerationWarning[]
  warnings: GenerationWarning[]
  stats: {
    totalErrors: number
    totalWarnings: number
    byType: Record<string, number>
  }
}

// ============================================
// DTOs (for API calls)
// ============================================

export interface CreateMonthDto {
  year: number
  month: number
  notes?: string
}

export interface UpdateMonthDto {
  status?: MonthStatus
  notes?: string
}

export interface UpdateDayDto {
  isHoliday?: boolean
  holidayName?: string | null
  occupancyPct?: number | null
  arrivals?: number | null
  departures?: number | null
  notes?: string | null
}

export interface UpdateAssignmentDto {
  shiftCode: string
  notes?: string | null
}

export interface BulkAssignmentDto {
  day_id: number
  employee_id: string
  shift_code: string
  notes?: string | null
}

export interface CreateConstraintDto {
  monthId: number
  employeeId: string
  constraintType: ConstraintType
  startDate: string
  endDate: string
  shiftCode?: string
  priority?: number
  notes?: string
}

export interface UpdateConstraintDto {
  constraintType?: ConstraintType
  startDate?: string
  endDate?: string
  shiftCode?: string | null
  priority?: number
  notes?: string | null
}

export interface ApproveConstraintDto {
  status: 'approved' | 'rejected'
  notes?: string
}

export interface CreateEmployeeRuleDto {
  employeeId: string
  ruleType: EmployeeRuleType
  ruleValue: string
  priority?: number
  notes?: string
}

export interface UpdateEmployeeRuleDto {
  ruleType?: EmployeeRuleType
  ruleValue?: string
  priority?: number
  isActive?: boolean
  notes?: string | null
}

export interface CreateShiftDto {
  code: string
  name: string
  startTime?: string | null
  endTime?: string | null
  hours: number
  color?: string
  isWorkShift?: boolean
  isPaid?: boolean
  displayOrder?: number
}

export interface UpdateShiftDto {
  code?: string
  name?: string
  startTime?: string | null
  endTime?: string | null
  hours?: number
  color?: string
  isWorkShift?: boolean
  isPaid?: boolean
  displayOrder?: number
  isActive?: boolean
}

// ============================================
// API RESPONSES
// ============================================

export interface MonthsListResponse {
  months: SchedulingMonth[]
  total: number
}

export interface MonthResponse {
  month: SchedulingMonthFull
}

export interface GenerateResponse {
  success: boolean
  result: GenerationResult
}

export interface ConstraintsResponse {
  constraints: SchedulingConstraint[]
  total: number
}

export interface RulesResponse {
  rules: SchedulingEmployeeRule[]
  total: number
}

export interface HistoryResponse {
  history: SchedulingHistory[]
  total: number
}

// ============================================
// EMPLOYEE CONTRACTS (Annual contract data)
// ============================================

export interface EmployeeContract {
  id: number
  employeeId: string
  employeeName: string
  year: number
  diasTrabajo: number
  horasAnuales: number
  diasVacaciones: number
  diasLibreSemanal: number
  diasBonificables: number
  diasIt: number
  diasLaborablesAno: number
  observaciones: string | null
}

export interface CreateContractDto {
  employee_id: string
  year: number
  dias_trabajo?: number
  horas_anuales?: number
  dias_vacaciones?: number
  dias_libre_semanal?: number
  dias_bonificables?: number
  dias_it?: number
  dias_laborables_ano?: number
  observaciones?: string | null
}

export interface UpdateContractDto {
  dias_trabajo?: number
  horas_anuales?: number
  dias_vacaciones?: number
  dias_libre_semanal?: number
  dias_bonificables?: number
  dias_it?: number
  dias_laborables_ano?: number
  observaciones?: string | null
}

// ============================================
// ANNUAL TOTALS (Calculated from published months)
// ============================================

export interface ConvenioData {
  diasTrabajo: number
  horasAnuales: number
  diasVacaciones: number
  diasLibreSemanal: number
  diasBonificables: number
  diasIt: number
  diasLaborablesAno: number
  observaciones: string | null
}

export interface DisfrutadosData {
  diasTrabajados: number
  horasTrabajadas: number
  diasVacaciones: number
  diasLibreSemanal: number
  diasIt: number
  diasBonificables: number
  total: number
  // Breakdown by shift
  M: number
  T: number
  N: number
  PI: number
  P: number
  FO: number
  E: number
  A: number
}

export interface PendienteData {
  diasATrabaja: number
  horasATrabaja: number
  diasVacaciones: number
  diasLibreSemanal: number
  diasIt: number
  diasBonificables: number
  total: number
}

export interface EmployeeAnnualTotals {
  employeeId: string
  employeeName: string
  year: number
  convenio: ConvenioData
  disfrutados: DisfrutadosData
  pendiente: PendienteData
  mesesIncluidos: number
  ultimoMesCalculado: { year: number; month: number } | null
}

export interface AnnualTotalsResponse {
  year: number
  employees: EmployeeAnnualTotals[]
  totalMesesPublicados: number
  fechaCalculo: string
}
