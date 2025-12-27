// app/dashboard/loading.tsx
/**
 * Route-level Loading State for Dashboard
 *
 * Shown instantly while the page is loading (server-side data fetching).
 * Next.js automatically wraps page.tsx in a Suspense boundary with this fallback.
 */

import { DashboardSkeleton } from '@/app/components/dashboard'

export default function DashboardLoading() {
  return <DashboardSkeleton />
}
