// app/dashboard/conciliation/loading.tsx
/**
 * Route-level Loading State for Conciliation
 */

function DatePickerSkeleton() {
  return (
    <div className="flex gap-1 overflow-hidden py-2">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  )
}

function FormSectionSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-[#151b23] rounded-lg border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded font-bold" />
      </div>
    </div>
  )
}

export default function ConciliationLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#010409] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-52 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Date Picker Skeleton */}
        <DatePickerSkeleton />

        {/* Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSectionSkeleton rows={5} />
          <FormSectionSkeleton rows={7} />
        </div>

        {/* Summary Section */}
        <div className="bg-white dark:bg-[#151b23] rounded-lg border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
              <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded ml-auto" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-9 w-28 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  )
}
