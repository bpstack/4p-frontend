// app/lib/backoffice/data.ts
/**
 * Server-only data fetching functions for Backoffice module
 * These functions run ONLY on the server and can safely use secrets
 *
 * Pattern: Direct fetch to backend API from Server Components
 * - No 'use client' directive
 * - Can use environment variables without NEXT_PUBLIC_ prefix
 * - Supports Next.js caching and revalidation
 * - Forwards auth cookies from the incoming request
 */

import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type {
  SummaryStats,
  Category,
  SupplierWithStats,
  InvoiceWithDetails,
  InvoiceFilters,
  CategoriesResponse,
  SuppliersResponse,
  InvoicesResponse,
  MonthlySummary,
  Asset,
  AssetsResponse,
} from './types'

// Server-side API URL (can use non-public env var)
import { SERVER_API_BASE_URL } from '@/app/lib/env'

const API_BASE = SERVER_API_BASE_URL

// ========================================
// HELPER: Get auth headers from cookies
// ========================================

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()

  // Try to get the access_token cookie
  const accessToken = cookieStore.get('access_token')?.value

  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` }
  }

  // Forward all cookies as a fallback (for HttpOnly cookies)
  const allCookies = cookieStore.getAll()
  if (allCookies.length > 0) {
    const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ')
    return { Cookie: cookieHeader }
  }

  return {}
}

/**
 * Check if user has auth cookie
 */
export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies()
  return !!cookieStore.get('access_token')?.value
}

// ========================================
// HELPER: Server-side fetch with auth
// ========================================

interface FetchOptions {
  revalidate?: number | false
  tags?: string[]
  cache?: RequestCache
}

async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 60, tags = [], cache } = options

  const url = `${API_BASE}${endpoint}`

  // Get auth headers from cookies
  const authHeaders = await getAuthHeaders()

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  }

  // Configure caching
  if (cache) {
    fetchOptions.cache = cache
  } else if (revalidate !== undefined) {
    fetchOptions.next = { revalidate, tags }
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    // If unauthorized, redirect to login
    if (response.status === 401) {
      redirect('/login')
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ========================================
// STATS - Server Component Data
// ========================================

/**
 * Fetch summary stats for the dashboard header
 * Uses cache: 'no-store' to ensure fresh data on every request
 */
export async function getStats(): Promise<SummaryStats> {
  return serverFetch<SummaryStats>('/api/backoffice/stats', {
    cache: 'no-store',
    // Note: tags are not used with cache: 'no-store' since there's no cache to invalidate
  })
}

/**
 * Fetch monthly summary for charts/reports
 */
export async function getMonthlySummary(year?: number): Promise<MonthlySummary[]> {
  const params = year ? `?year=${year}` : ''
  const response = await serverFetch<{ summary: MonthlySummary[] }>(
    `/api/backoffice/stats/monthly${params}`,
    { revalidate: 300, tags: ['backoffice-monthly'] }
  )
  return response.summary
}

// ========================================
// CATEGORIES - Server Component Data
// ========================================

/**
 * Fetch all active categories
 * Long cache - categories rarely change
 */
export async function getCategories(): Promise<Category[]> {
  const response = await serverFetch<CategoriesResponse>('/api/backoffice/categories', {
    revalidate: 3600, // 1 hour cache
    tags: ['backoffice-categories'],
  })
  return response.categories
}

// ========================================
// SUPPLIERS - Server Component Data
// ========================================

/**
 * Fetch suppliers with optional filters and pagination
 * Used for initial server render, then client takes over for filtering
 */
export async function getSuppliers(
  page = 1,
  limit = 100
): Promise<{
  suppliers: SupplierWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const endpoint = `/api/backoffice/suppliers?${params.toString()}`

  const response = await serverFetch<SuppliersResponse>(endpoint, {
    revalidate: 60,
    tags: ['backoffice-suppliers'],
  })

  return {
    suppliers: response.suppliers,
    pagination: response.pagination,
  }
}

/**
 * Fetch single supplier by ID with stats and recent invoices
 */
export async function getSupplierById(id: number): Promise<{
  supplier: SupplierWithStats
  invoices: InvoiceWithDetails[]
} | null> {
  try {
    const response = await serverFetch<{
      supplier: SupplierWithStats
      invoices: InvoiceWithDetails[]
    }>(`/api/backoffice/suppliers/${id}`, {
      revalidate: 60,
      tags: [`backoffice-supplier-${id}`],
    })
    return response
  } catch {
    return null
  }
}

// ========================================
// INVOICES - Server Component Data
// ========================================

/**
 * Fetch invoices with filters and pagination
 * Primary data fetching for invoice tables
 * Uses cache: 'no-store' to ensure fresh data on every request
 * (validated_pdf_url and other fields must reflect latest DB state)
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<{
  invoices: InvoiceWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  const params = new URLSearchParams()

  if (filters?.status) params.append('status', filters.status)
  if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString())
  if (filters?.category_id) params.append('category_id', filters.category_id.toString())
  if (filters?.payment_method) params.append('payment_method', filters.payment_method)
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.include_deleted) params.append('include_deleted', 'true')
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const endpoint = `/api/backoffice/invoices${queryString ? `?${queryString}` : ''}`

  const response = await serverFetch<InvoicesResponse>(endpoint, {
    cache: 'no-store', // Always fetch fresh data - critical for validated_pdf_url
    // Note: tags are not used with cache: 'no-store' since there's no cache to invalidate
  })

  return {
    invoices: response.invoices,
    pagination: response.pagination,
  }
}

/**
 * Fetch pending invoices specifically
 * Includes both 'pending' and 'validated' status
 * (validated invoices are pending payment at start of next month)
 */
export async function getPendingInvoices(
  page = 1,
  limit = 50
): Promise<{
  invoices: InvoiceWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  return getInvoices({ status: 'pending,validated', page, limit })
}

/**
 * Fetch paid invoices specifically
 * Convenience function for the paid tab
 * Default limit of 100 for better UX with monthly filtering
 */
export async function getPaidInvoices(
  page = 1,
  limit = 100
): Promise<{
  invoices: InvoiceWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  return getInvoices({ status: 'paid', page, limit })
}

/**
 * Fetch single invoice by ID with history
 */
export async function getInvoiceById(id: number): Promise<{
  invoice: InvoiceWithDetails
  history: Array<{
    id: number
    action: string
    changed_by: string
    changed_at: string
    notes: string | null
  }>
} | null> {
  try {
    const response = await serverFetch<{
      invoice: InvoiceWithDetails
      history: Array<{
        id: number
        action: string
        changed_by: string
        changed_at: string
        notes: string | null
      }>
    }>(`/api/backoffice/invoices/${id}`, {
      revalidate: 30,
      tags: [`backoffice-invoice-${id}`],
    })
    return response
  } catch {
    return null
  }
}

// ========================================
// ASSETS - Server Component Data
// ========================================

/**
 * Fetch all assets (stamps and signatures)
 * Used for the settings tab and PDF editor
 */
export async function getAssets(): Promise<Asset[]> {
  try {
    const response = await serverFetch<AssetsResponse>('/api/backoffice/assets', {
      revalidate: 300, // 5 minute cache
      tags: ['backoffice-assets'],
    })
    return response.assets
  } catch {
    return []
  }
}
