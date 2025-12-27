// app/lib/conciliation/types.ts

// ═══════════════════════════════════════════════════════
// BASE TYPES
// ═══════════════════════════════════════════════════════

export type ReceptionReason = 'base_rooms' | 'gratuity' | 'no_show' | 'room_change' | 'other'

export type HousekeepingReason =
  | 'cleaned'
  | 'do_not_disturb'
  | 'ooo_cleaned'
  | 'pending_cleaned'
  | 'pending_to_clean'
  | 'room_clean'
  | 'other'

export type Direction = 'add' | 'subtract'
export type ConciliationStatus = 'draft' | 'confirmed' | 'closed'

// ═══════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════

export interface ConciliationSummary {
  id?: number
  date: string
  total_reception: number
  total_housekeeping: number
  difference?: number
  notes?: string | null
  status: ConciliationStatus
  created_by?: string | null
  updated_by?: string | null
  department_id?: number | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ReceptionEntryWithReason {
  id?: number
  conciliation_id: number
  reason: ReceptionReason
  direction: Direction
  value: number
  room_number: string | null
  notes: string | null
}

export interface HousekeepingEntryWithReason {
  id?: number
  conciliation_id: number
  reason: HousekeepingReason
  direction: Direction
  value: number
  room_number: string | null
  notes: string | null
}

export interface ConciliationDetail extends ConciliationSummary {
  reception_entries?: ReceptionEntryWithReason[]
  housekeeping_entries?: HousekeepingEntryWithReason[]
}

// ═══════════════════════════════════════════════════════
// UI PROPS
// ═══════════════════════════════════════════════════════

export interface ConciliationPageProps {
  conciliation: ConciliationDetail | null
  loading: boolean
  dayStatusMessage: string
  onUpdate: () => void
}

export interface EntryForm {
  value: number
  room_number: string
  notes: string
}

export interface Note {
  id: string
  text: string
  author: string
  timestamp: string
  author_id: string
}

// ═══════════════════════════════════════════════════════
// MONTHLY SUMMARY
// ═══════════════════════════════════════════════════════

export interface MonthlySummary {
  metadata: {
    year: number
    month: number
    status: ConciliationStatus
  }
  period: {
    start: string
    end: string
    total_days: number
    conciliations_count: number
    missing_days: number
  }
  reception_summary: Array<{
    reason: string
    label: string
    total: number
  }>
  housekeeping_summary: Array<{
    reason: string
    label: string
    total: number
  }>
  totals: {
    total_reception: number
    total_housekeeping: number
    difference: number
  }
  can_close: boolean
  validation_errors: string[]
}

// ═══════════════════════════════════════════════════════
// FORM DTOs
// ═══════════════════════════════════════════════════════

export interface ConciliationFormData {
  reception: Array<{
    reason: ReceptionReason
    value: number
    room_number: string
    notes: string
  }>
  housekeeping: Array<{
    reason: HousekeepingReason
    value: number
    room_number: string
    notes: string
  }>
  notes?: string
}

export interface CreateConciliationDTO {
  date: string
  notes?: string
}
