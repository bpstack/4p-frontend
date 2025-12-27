// app/components/ui/Card.tsx
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-gray-50 dark:bg-[#0D1117]', // ← bg-gray-50 para modo claro
        'border border-gray-200 dark:border-gray-800',
        'rounded-lg shadow-sm',
        !noPadding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  )
}
