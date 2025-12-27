// app/components/bo/TabContent.tsx
/**
 * Client Component - Tab Content Wrapper
 *
 * Reads the current tab from URL and renders the appropriate content.
 */

'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { TabType } from './TabsNavigation'
import type {
  InvoiceWithDetails,
  SupplierWithStats,
  Category,
  Asset,
} from '@/app/lib/backoffice/types'

// Import tab components
import { PendingInvoicesTabLazy } from './tabs/PendingInvoicesTabLazy'
import { PaidInvoicesTabLazy } from './tabs/PaidInvoicesTabLazy'
import { SuppliersTabLazy } from './tabs/SuppliersTabLazy'
import { SettingsTabLazy } from './tabs/SettingsTabLazy'

interface TabContentProps {
  // Initial data passed from server
  pendingInvoices: InvoiceWithDetails[]
  paidInvoices: InvoiceWithDetails[]
  suppliers: SupplierWithStats[]
  categories: Category[]
  assets: Asset[]
  // Pagination info
  pendingPagination: { page: number; total: number; totalPages: number; limit?: number }
  paidPagination: { page: number; total: number; totalPages: number; limit?: number }
  suppliersPagination: { page: number; total: number; totalPages: number; limit?: number }
}

export function TabContent({
  pendingInvoices,
  paidInvoices,
  suppliers,
  categories,
  assets,
  pendingPagination,
  paidPagination,
  suppliersPagination,
}: TabContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentTab = (searchParams.get('tab') as TabType) || 'pending'

  // Handle page change for paid invoices
  const handlePaidPageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'paid')
      params.set('paidPage', newPage.toString())
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  // Handle page change for suppliers
  const handleSuppliersPageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'suppliers')
      params.set('suppliersPage', newPage.toString())
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  return (
    <div className="mt-4">
      {currentTab === 'pending' && (
        <PendingInvoicesTabLazy
          initialInvoices={pendingInvoices}
          categories={categories}
          suppliers={suppliers}
          pagination={{ ...pendingPagination, limit: pendingPagination.limit ?? 50 }}
        />
      )}
      {currentTab === 'paid' && (
        <PaidInvoicesTabLazy
          initialInvoices={paidInvoices}
          categories={categories}
          pagination={{ ...paidPagination, limit: paidPagination.limit ?? 50 }}
          onPageChange={handlePaidPageChange}
        />
      )}
      {currentTab === 'suppliers' && (
        <SuppliersTabLazy
          initialSuppliers={suppliers}
          categories={categories}
          pagination={{ ...suppliersPagination, limit: suppliersPagination.limit ?? 100 }}
          onPageChange={handleSuppliersPageChange}
        />
      )}
      {currentTab === 'settings' && <SettingsTabLazy initialAssets={assets} />}
    </div>
  )
}
