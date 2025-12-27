// app/components/maintenance/shared/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-[4px]',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-blue-600 dark:border-blue-500 border-r-transparent`}
      />
      {message && (
        <p className={`mt-3 ${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}>
          {message}
        </p>
      )}
    </div>
  )
}
