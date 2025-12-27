// app/components/groups/shared/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-solid border-blue-600 dark:border-blue-500 border-r-transparent ${sizeClasses[size]}`}
      />
      {message && <p className="text-xs text-gray-600 dark:text-gray-400">{message}</p>}
    </div>
  )
}
