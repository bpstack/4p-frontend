// app/components/ui/Select.tsx
'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, fullWidth = true, options, placeholder, className, ...props },
    ref
  ) => {
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

        <select
          ref={ref}
          className={clsx(
            // Base styles
            'px-3 py-2 rounded-md border text-sm',
            'bg-white dark:bg-[#161B22]', // ← bg-white en modo claro
            'text-gray-900 dark:text-gray-100',
            'transition-colors duration-200',
            'cursor-pointer',

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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        {helperText && !error && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
