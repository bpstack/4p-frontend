// app/components/parking/ActionDropdown.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { FiX } from 'react-icons/fi'
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaEdit,
  FaExclamationTriangle,
  FaEllipsisV,
} from 'react-icons/fa'
import type { ParkingBooking } from '@/app/lib/parking/types'

interface ActionDropdownProps {
  booking: ParkingBooking
  onAction: (action: string, booking: ParkingBooking) => void
}

// Configuración de acciones con las claves de traducción
const ACTIONS_CONFIG: Record<
  string,
  Array<{
    id: string
    translationKey: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    divider?: boolean
  }>
> = {
  reserved: [
    {
      id: 'checkin',
      translationKey: 'actions.checkIn',
      icon: FaSignInAlt,
      color: 'text-green-600 dark:text-green-500',
    },
    {
      id: 'edit',
      translationKey: 'actions.edit',
      icon: FaEdit,
      color: 'text-blue-600 dark:text-blue-500',
    },
    {
      id: 'cancel',
      translationKey: 'actions.cancel',
      icon: FiX,
      color: 'text-red-600 dark:text-red-500',
      divider: true,
    },
    {
      id: 'noshow',
      translationKey: 'actions.noShow',
      icon: FaExclamationTriangle,
      color: 'text-orange-600 dark:text-orange-500',
    },
  ],
  checked_in: [
    {
      id: 'checkout',
      translationKey: 'actions.checkOut',
      icon: FaSignOutAlt,
      color: 'text-blue-600 dark:text-blue-500',
    },
    {
      id: 'cancel',
      translationKey: 'actions.cancel',
      icon: FiX,
      color: 'text-red-600 dark:text-red-500',
    },
  ],
}

/**
 * Dropdown de acciones para una reserva
 * Usa Portal para evitar problemas de overflow en tablas
 */
export function ActionDropdown({ booking, onAction }: ActionDropdownProps) {
  const t = useTranslations('parking')
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, openUpward: false })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 200
      const openUpward = spaceBelow < dropdownHeight

      setPosition({
        top: openUpward ? rect.top - dropdownHeight : rect.bottom + 4,
        left: rect.right - 224,
        openUpward,
      })
    }
    setIsOpen(!isOpen)
  }

  const availableActions = ACTIONS_CONFIG[booking.status] || []

  if (availableActions.length === 0) {
    return <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
  }

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="w-56 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg shadow-2xl overflow-hidden"
    >
      {availableActions.map((action, index) => {
        const Icon = action.icon
        return (
          <div key={action.id}>
            {action.divider && index > 0 && (
              <div className="h-px bg-gray-200 dark:bg-[#30363d] my-1" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onAction(action.id, booking)
              }}
              className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors group"
            >
              <Icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {t(action.translationKey)}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        title={t('actions.title')}
      >
        <FaEllipsisV className="w-4 h-4" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}

export default ActionDropdown
