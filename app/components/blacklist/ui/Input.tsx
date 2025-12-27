// app/components/ui/Input.tsx
'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={clsx(
            // Base styles
            'px-3 py-2 rounded-md border text-sm',
            'bg-white dark:bg-[#161B22]', // ← bg-white en modo claro
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'transition-colors duration-200',

            // Focus styles
            'focus:outline-none focus:ring-2 focus:ring-offset-0',

            // States
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500',

            // Disabled
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800',

            className
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        {helperText && !error && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
