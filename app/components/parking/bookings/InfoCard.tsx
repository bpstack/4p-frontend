// app/components/parking/bookings/InfoCard.tsx
'use client'

import { ReactNode } from 'react'

interface InfoCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  variant?: 'default' | 'highlighted'
}

export function InfoCard({
  title,
  icon,
  children,
  className = '',
  variant = 'default',
}: InfoCardProps) {
  const bgClass =
    variant === 'highlighted' ? 'bg-[#f6f8fa] dark:bg-[#0d1117]' : 'bg-white dark:bg-[#151b23]'

  return (
    <div
      className={`${bgClass} border border-[#d0d7de] dark:border-[#30363d] rounded-md ${className}`}
    >
      <div className="px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d]">
        <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#f0f6fc] flex items-center gap-2">
          {icon && <span className="text-[#57606a] dark:text-[#8b949e]">{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: ReactNode
  highlight?: boolean
  mono?: boolean
}

export function InfoRow({ label, value, highlight = false, mono = false }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#d0d7de]/50 dark:border-[#30363d]/50 last:border-0">
      <span className="text-xs text-[#57606a] dark:text-[#8b949e]">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight ? 'text-[#0969da] dark:text-[#58a6ff]' : 'text-[#24292f] dark:text-[#f0f6fc]'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

export default InfoCard
