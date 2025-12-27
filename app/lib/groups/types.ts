// app/lib/groups/types.ts

// =============== ENUMS ===============

export enum GroupStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RoomType {
  SINGLE = 'single',
  DOUBLE_BED = 'double_bed',
  TWIN_BEDS = 'twin_beds',
}

export enum RoomingStatus {
  PENDING = 'pending',
  REQUESTED = 'requested',
  RECEIVED = 'received',
}

export enum BalanceStatus {
  PENDING = 'pending',
  REQUESTED = 'requested',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export enum PaymentStatus {
  PENDING = 'pending',
  REQUESTED = 'requested',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export enum HistoryAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  STATUS_CHANGED = 'status_changed',
  PAYMENT_UPDATED = 'payment_updated',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// =============== INTERFACES ===============

export interface Group {
  id: number
  name: string
  agency: string | null
  arrival_date: string
  departure_date: string
  status: GroupStatus
  total_amount: number | null
  currency: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}

export interface GroupWithDetails extends Group {
  created_by_username?: string
  updated_by_username?: string
  booking_confirmed?: boolean
  booking_confirmed_date?: string | null
  contract_signed?: boolean
  contract_signed_date?: string | null
  rooming_status?: RoomingStatus
  rooming_requested_date?: string | null
  rooming_received_date?: string | null
  rooming_deadline?: string | null
  balance_status?: BalanceStatus
  balance_requested_date?: string | null
  balance_paid_date?: string | null
}

export interface GroupPayment {
  id: number
  group_id: number
  payment_name: string
  payment_order: number
  percentage: number | null
  amount: number
  amount_paid: number
  due_date: string
  status: PaymentStatus
  status_updated_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PaymentWithGroupInfo extends GroupPayment {
  group_name?: string
  group_total_amount?: number
  agency?: string
  days_until_due?: number
  days_overdue?: number
}

export interface GroupContact {
  id: number
  group_id: number
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface GroupRoom {
  id: number
  group_id: number
  room_type: RoomType
  quantity: number
  guests_per_room: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GroupStatusRecord {
  id: number
  group_id: number
  booking_confirmed: boolean
  booking_confirmed_date: string | null
  contract_signed: boolean
  contract_signed_date: string | null
  rooming_status: RoomingStatus
  rooming_requested_date: string | null
  rooming_received_date: string | null
  rooming_deadline: string | null
  balance_status: BalanceStatus
  balance_requested_date: string | null
  balance_paid_date: string | null
  created_at: string
  updated_at: string
}

export interface GroupHistoryRecord {
  id: number
  group_id: number
  action: HistoryAction
  table_affected: string | null
  record_id: number | null
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  changed_by: string | null
  changed_at: string
  notes: string | null
  // Joined fields
  changed_by_username?: string
}

export interface PaymentBalance {
  total_amount: number
  total_paid: number
  remaining: number
  percentage_paid: number
}

export interface DashboardOverview {
  total_groups: number
  confirmed_groups: number
  active_groups: number
  pending_groups: number
  total_revenue: number | null
}

export interface GroupTimeline {
  id: number
  name: string
  agency: string | null
  arrival_date: string
  departure_date: string
  status: GroupStatus
  total_amount: number | null
  month: string
}

// =============== NOTIFICATIONS ===============

export interface GroupNotification {
  id: number
  group_id: number
  title: string
  message: string
  priority: NotificationPriority
  scheduled_for: string | null
  status: 'pending' | 'sent' | 'failed'
  sent_at: string | null
  created_by: string | null
  created_at: string
}

// =============== DTOs ===============

export interface CreateGroupDTO {
  name: string
  agency?: string
  arrival_date: string
  departure_date: string
  status?: GroupStatus
  total_amount?: number
  currency?: string
  notes?: string
}

export interface UpdateGroupDTO {
  name?: string
  agency?: string
  arrival_date?: string
  departure_date?: string
  status?: GroupStatus
  total_amount?: number
  currency?: string
  notes?: string
}

export interface CreateGroupPaymentDTO {
  payment_name: string
  payment_order?: number
  percentage?: number
  amount?: number
  amount_paid?: number
  due_date: string
  status?: PaymentStatus
  notes?: string
}

export interface UpdateGroupPaymentDTO {
  payment_name?: string
  payment_order?: number
  percentage?: number
  amount?: number
  amount_paid?: number
  due_date?: string
  status?: PaymentStatus
  notes?: string
}

export interface UpdateGroupStatusDTO {
  booking_confirmed?: boolean
  booking_confirmed_date?: string
  contract_signed?: boolean
  contract_signed_date?: string
  rooming_status?: RoomingStatus
  rooming_requested_date?: string
  rooming_received_date?: string
  rooming_deadline?: string
  balance_status?: BalanceStatus
  balance_requested_date?: string
  balance_paid_date?: string
}

export interface UpdateBookingDTO {
  confirmed: boolean
  date?: string
}

export interface UpdateContractDTO {
  signed: boolean
  date?: string
}

export interface UpdateRoomingDTO {
  rooming_status?: RoomingStatus
  rooming_requested_date?: string
  rooming_received_date?: string
  rooming_deadline?: string
}

export interface UpdateBalanceDTO {
  balance_status?: BalanceStatus
  balance_requested_date?: string
  balance_paid_date?: string
}

export interface CreateGroupContactDTO {
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  is_primary?: boolean
}

export interface UpdateGroupContactDTO {
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  is_primary?: boolean
}

export interface CreateGroupRoomDTO {
  room_type: RoomType
  quantity: number
  guests_per_room?: number
  notes?: string
}

export interface UpdateGroupRoomDTO {
  room_type?: RoomType
  quantity?: number
  guests_per_room?: number
  notes?: string
}

export interface CreateNotificationDTO {
  title: string
  message: string
  priority: NotificationPriority
  scheduled_for?: string
}

// =============== FILTERS ===============

export interface GroupFilters {
  status?: GroupStatus
  arrival_from?: string
  arrival_to?: string
  departure_from?: string
  departure_to?: string
  agency?: string
  sort?: string
  order?: 'ASC' | 'DESC'
  limit?: number
  offset?: number
}
