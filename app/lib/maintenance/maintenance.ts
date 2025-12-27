// app/lib/maintenance/maintenance.ts

export type LocationType = 'room' | 'common_area' | 'exterior' | 'facilities' | 'other'
export type ReportStatus =
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'waiting'
  | 'completed'
  | 'closed'
  | 'canceled'
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent'
export type AssignedType = 'internal' | 'external'
export type HistoryAction =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'updated'
  | 'assigned'
  | 'resolved'
  | 'closed'
  | 'deleted'

export interface MaintenanceReport {
  id: string
  report_date: string
  location_type: LocationType
  location_description: string
  title: string
  description: string
  priority: ReportPriority
  status: ReportStatus
  room_number: string | null
  room_out_of_service: boolean | null
  assigned_to: string | null
  assigned_type: AssignedType | null
  external_company_name: string | null
  external_contact: string | null
  started_at: string | null
  resolved_at: string | null
  closed_at: string | null
  resolution_notes: string | null
  is_deleted: boolean
  deleted_at: string | null
  deleted_by: string | null
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string
}

export interface MaintenanceImage {
  id: number
  report_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_at: string
  uploaded_by: string
  auto_delete_on_close: boolean
}

export interface MaintenanceHistory {
  id: number
  report_id: string
  action: HistoryAction
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  notes: string | null
  changed_by: string
  changed_at: string
  user_name?: string
}

export interface ReportWithDetails extends MaintenanceReport {
  images: MaintenanceImage[]
  history: MaintenanceHistory[]
  created_by_name?: string
  assigned_to_name?: string
}

export interface ReportFormData {
  location_type: LocationType
  location_description: string
  title: string
  description: string
  priority: ReportPriority
  room_number?: string
  room_out_of_service?: boolean
  assigned_to?: string
  assigned_type?: AssignedType
  external_company_name?: string
  external_contact?: string
}

export interface ReportFilters {
  status?: ReportStatus
  priority?: ReportPriority
  location_type?: LocationType
  search?: string
  date_from?: string
  date_to?: string
}
