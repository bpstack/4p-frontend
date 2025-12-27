// app/dashboard/profile/loading.tsx
/**
 * Route-level Loading State for Profile
 */

export default function ProfileLoading() {
  return (
    <div className="h-full min-h-screen bg-white dark:bg-[#010409]">
      <div className="h-full flex flex-col lg:flex-row gap-6 p-4 md:p-6">
        {/* Left Panel - Profile Sidebar Skeleton */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363d] rounded-xl p-6 animate-pulse">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>

            {/* Info Section */}
            <div className="space-y-3 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

            {/* Menu Items */}
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel - Empty State Skeleton */}
        <main className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
            <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded mx-auto" />
          </div>
        </main>
      </div>
    </div>
  )
}
