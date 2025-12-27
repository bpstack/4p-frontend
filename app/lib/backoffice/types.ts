// app/lib/backoffice/types.ts
/**
 * Tipos TypeScript para el módulo Back Office
 * Gestión de proveedores, facturas, categorías y assets
 */

// ========================================
// CATEGORÍAS
// ========================================

export interface Category {
  id: number
  cost_center: string
  department: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ========================================
// PROVEEDORES
// ========================================

export type Periodicity = 'monthly' | 'bimonthly' | 'quarterly' | 'annual' | 'on_demand'
export type PaymentMethod = 'transfer' | 'direct_debit'

export interface Supplier {
  id: number
  name: string
  cif: string | null
  default_category_id: number | null
  periodicity: Periodicity
  payment_method: PaymentMethod
  bank_account: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SupplierWithStats extends Supplier {
  cost_center: string | null
  department: string | null
  category_full: string | null
  total_invoices: number
  pending_invoices: number
  paid_invoices: number
  ytd_total: number
  last_invoice_date: string | null
}

export interface SupplierFormData {
  name: string
  cif?: string
  default_category_id?: number
  periodicity?: Periodicity
  payment_method?: PaymentMethod
  bank_account?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

// ========================================
// FACTURAS
// ========================================

export type InvoiceStatus = 'pending' | 'validated' | 'rejected' | 'paid'

export interface Invoice {
  id: number
  invoice_number: string
  supplier_id: number
  category_id: number | null
  amount_without_vat: number
  amount_with_vat: number
  vat_percentage: number
  invoice_date: string
  received_date: string | null
  billing_period_start: string | null
  billing_period_end: string | null
  due_date: string | null
  paid_date: string | null
  status: InvoiceStatus
  payment_method: PaymentMethod
  original_pdf_url: string | null
  original_pdf_public_id: string | null
  validated_pdf_url: string | null
  validated_pdf_public_id: string | null
  validated_by: string | null
  validated_at: string | null
  validation_notes: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string
  is_deleted: boolean
}

export interface InvoiceWithDetails extends Invoice {
  supplier_name: string
  cost_center: string | null
  department: string | null
  category_full: string | null
  validated_by_name: string | null
  created_by_name: string | null
}

export interface InvoiceFormData {
  invoice_number: string
  supplier_id: number
  category_id?: number
  amount_without_vat: number
  amount_with_vat: number
  vat_percentage?: number
  invoice_date: string
  received_date?: string
  billing_period_start?: string
  billing_period_end?: string
  due_date?: string
  payment_method?: PaymentMethod
  notes?: string
}

// ========================================
// HISTORIAL DE FACTURAS
// ========================================

export type InvoiceAction =
  | 'created'
  | 'updated'
  | 'validated'
  | 'rejected'
  | 'paid'
  | 'deleted'
  | 'restored'

export interface InvoiceHistory {
  id: number
  invoice_id: number
  action: InvoiceAction
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  notes: string | null
  changed_by: string
  changed_by_name?: string
  changed_at: string
}

// ========================================
// ASSETS (SELLOS Y FIRMAS)
// ========================================

export type AssetType = 'stamp' | 'signature'

export interface Asset {
  id: number
  type: AssetType
  name: string
  cloudinary_url: string
  cloudinary_public_id: string
  is_default: boolean
  created_by: string | null
  created_at: string
}

export interface AssetFormData {
  type: AssetType
  name: string
  is_default?: boolean
  image: File
}

// ========================================
// FILTROS
// ========================================

export interface InvoiceFilters {
  status?: string // Supports single status or comma-separated (e.g., "pending,validated")
  supplier_id?: number
  category_id?: number
  payment_method?: PaymentMethod
  date_from?: string
  date_to?: string
  search?: string
  include_deleted?: boolean
  page?: number
  limit?: number
}

export interface SupplierFilters {
  category_id?: number
  periodicity?: Periodicity
  payment_method?: PaymentMethod
  is_active?: boolean
  search?: string
  page?: number
  limit?: number
}

// ========================================
// ESTADÍSTICAS
// ========================================

export interface SummaryStats {
  pending_count: number
  pending_total: number
  paid_this_month: number
  paid_total_this_month: number
  paid_count: number
  paid_total: number
  overdue_count: number
  suppliers_count: number
}

export interface MonthlySummary {
  year: number
  month: number
  invoice_count: number
  total_amount: number
  paid_amount: number
  pending_amount: number
}

// ========================================
// RESPUESTAS API
// ========================================

export interface CategoriesResponse {
  categories: Category[]
}

export interface SuppliersResponse {
  suppliers: SupplierWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SupplierDetailResponse {
  supplier: SupplierWithStats
  invoices: InvoiceWithDetails[]
}

export interface InvoicesResponse {
  invoices: InvoiceWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters_applied: InvoiceFilters
}

export interface InvoiceDetailResponse {
  invoice: InvoiceWithDetails
  history: InvoiceHistory[]
}

export interface AssetsResponse {
  assets: Asset[]
}

export type StatsResponse = SummaryStats

export interface MonthlySummaryResponse {
  summary: MonthlySummary[]
}

// ========================================
// CONSTANTES DE VISUALIZACIÓN
// ========================================

export const PERIODICITY_LABELS: Record<Periodicity, string> = {
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  annual: 'Anual',
  on_demand: 'Bajo demanda',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer: 'Transferencia',
  direct_debit: 'Domiciliado',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: 'Pendiente',
  validated: 'Validada',
  rejected: 'Rechazada',
  paid: 'Pagada',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  validated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stamp: 'Sello',
  signature: 'Firma',
}

// ========================================
// HELPERS
// ========================================

/**
 * Formatea un número como moneda (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Obtiene el color de badge según el estado de la factura
 */
export function getStatusBadgeClasses(status: InvoiceStatus): string {
  return INVOICE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Calcula el IVA desde los importes
 */
export function calculateVat(amountWithVat: number, amountWithoutVat: number): number {
  if (amountWithoutVat === 0) return 0
  return ((amountWithVat - amountWithoutVat) / amountWithoutVat) * 100
}

/**
 * Calcula el importe con IVA desde el importe sin IVA
 */
export function applyVat(amountWithoutVat: number, vatPercentage: number = 21): number {
  return amountWithoutVat * (1 + vatPercentage / 100)
}
