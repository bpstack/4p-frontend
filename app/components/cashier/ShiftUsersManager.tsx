// app/components/cashier/ShiftUsersManager.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { FiUsers, FiPlus, FiX, FiChevronDown } from 'react-icons/fi'
import { useUsers, useUpdateShiftUsers } from '@/app/lib/cashier/queries'
import type { CashierShiftUser } from '@/app/lib/cashier/types'
import { toast } from 'react-hot-toast'

interface ShiftUsersManagerProps {
  shiftId: number
  users: CashierShiftUser[]
  isEditable: boolean
}

export default function ShiftUsersManager({ shiftId, users, isEditable }: ShiftUsersManagerProps) {
  const t = useTranslations('cashier')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: allUsers, isLoading: loadingUsers } = useUsers()
  const updateUsersMutation = useUpdateShiftUsers()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get primary user
  const primaryUser = users.find((u) => u.is_primary === 1)
  const secondaryUsers = users.filter((u) => u.is_primary === 0)

  // Filter available users (not already assigned)
  const assignedUserIds = users.map((u) => u.user_id)
  const availableUsers = allUsers?.filter(
    (u) => !assignedUserIds.includes(u.id) && u.is_active === 1
  )

  const handleAddUser = async (userId: string) => {
    if (!primaryUser) return

    try {
      const newSecondaryIds = [...secondaryUsers.map((u) => u.user_id), userId]
      await updateUsersMutation.mutateAsync({
        shiftId,
        primaryUserId: primaryUser.user_id,
        secondaryUserIds: newSecondaryIds,
      })
      toast.success(t('shiftUsers.userAdded'))
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error(t('shiftUsers.errorAdding'))
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!primaryUser) return

    try {
      const newSecondaryIds = secondaryUsers
        .filter((u) => u.user_id !== userId)
        .map((u) => u.user_id)
      await updateUsersMutation.mutateAsync({
        shiftId,
        primaryUserId: primaryUser.user_id,
        secondaryUserIds: newSecondaryIds,
      })
      toast.success(t('shiftUsers.userRemoved'))
    } catch (error) {
      console.error('Error removing user:', error)
      toast.error(t('shiftUsers.errorRemoving'))
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 flex-wrap">
      <FiUsers className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">{t('shiftCard.responsible')}:</span>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Primary user (cannot be removed) */}
        {primaryUser && (
          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
            {primaryUser.username} ({t('shiftCard.primary')})
          </span>
        )}

        {/* Secondary users (can be removed if editable) */}
        {secondaryUsers.map((user) => (
          <span
            key={user.user_id}
            className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center gap-1"
          >
            {user.username}
            {isEditable && (
              <button
                onClick={() => handleRemoveUser(user.user_id)}
                disabled={updateUsersMutation.isPending}
                className="ml-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                title={t('shiftUsers.remove')}
              >
                <FiX className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* Add user button/dropdown */}
        {isEditable && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loadingUsers || updateUsersMutation.isPending}
              className="px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1 disabled:opacity-50"
              title={t('shiftUsers.addUser')}
            >
              <FiPlus className="w-3 h-3" />
              <FiChevronDown
                className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                {loadingUsers ? (
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('common.loading')}...
                  </div>
                ) : availableUsers && availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddUser(user.id)}
                      disabled={updateUsersMutation.isPending}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {user.username}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('shiftUsers.noUsersAvailable')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
