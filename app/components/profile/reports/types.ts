// app/components/profile/reports/types.ts

// ═══════════════════════════════════════════════════════
// UNIFIED ACTIVITY
// ═══════════════════════════════════════════════════════

export type ActivitySource = 'cashier' | 'groups' | 'logbook' | 'maintenance'

export interface UnifiedActivity {
  id: string
  source: ActivitySource
  action: string
  user_id: string
  username: string
  timestamp: string
  record_id: string | number | null
}

// ═══════════════════════════════════════════════════════
// LOGBOOK
// ═══════════════════════════════════════════════════════

export interface LogbookHistoryEntry {
  id: number
  logbook_id?: number
  type: 'logbook' | 'comment'
  action: string
  previousContent: unknown
  newContent: unknown
  createdAt: string
  editor: {
    id: string
    username: string
    email: string
  } | null
  department?: number | null
  logbook?: {
    id: number
    authorId: string
    message: string
    importance: string
    isSolved: boolean
    solvedAt: string | null
    solvedBy: string | null
    departmentId: number
  }
}

export interface LogbookEntry {
  id: number
  message: string
  author_id: string
  author_name?: string // Backend returns author_name from JOIN
  importance_level: 'baja' | 'media' | 'alta' | 'urgente'
  department_id: number
  department_name?: string
  is_solved: number | boolean // Backend returns 0/1, frontend may convert to boolean
  solved_by?: string
  solved_at?: string
  date: string
  created_at: string
  deleted_at: string | null
}

// ═══════════════════════════════════════════════════════
// MAINTENANCE
// ═══════════════════════════════════════════════════════

export interface MaintenanceHistoryEntry {
  id: number
  report_id: string
  action: string
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  changed_by: string
  user_name?: string // Backend returns user_name from JOIN
  changed_at: string
}

export interface MaintenanceReport {
  id: string
  title: string
  description: string | null
  location_type: string
  location_description: string | null
  room_number: string | null
  status: string
  priority: string
  created_by: string
  created_by_name?: string // Backend returns this from JOIN
  created_at: string
  deleted_at: string | null
}

// ═══════════════════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════════════════

export interface GroupHistoryEntry {
  id: number
  group_id: number
  action: string
  table_affected: string | null
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  changed_by: string
  changed_by_username?: string
  changed_at: string
}

// ═══════════════════════════════════════════════════════
// CASHIER
// ═══════════════════════════════════════════════════════

export interface CashierHistoryEntry {
  id: number
  shift_id: number
  action: string
  table_affected: string | null
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  changed_by: string
  changed_by_username?: string
  changed_at: string
}

// ═══════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════

export type ReportSection = 'overview' | 'logbooks' | 'maintenance' | 'groups' | 'cashier'
