// app/components/layout/ProfileDropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiMessageSquare,
  FiBell,
} from 'react-icons/fi'
import { useAuth } from '@/app/lib/auth/useAuth'
import { useNotifications } from '@/app/lib/notifications/useNotifications'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const t = useTranslations('common.profile')

  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()

  // Cerrar dropdown al hacer click fuera
  // IMPORTANTE: useEffect debe estar ANTES de cualquier return condicional
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // Si no hay usuario, no renderizar nada (DESPUES de todos los hooks)
  if (!user) return null

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleProfile = () => {
    setIsOpen(false)
    router.push('/dashboard/profile')
  }

  const handleMessages = () => {
    setIsOpen(false)
    router.push('/dashboard/profile?panel=messages')
  }

  const handleNotifications = () => {
    setIsOpen(false)
    router.push('/dashboard/profile?panel=notifications')
  }

  const handleSettings = () => {
    setIsOpen(false)
    router.push('/dashboard/profile?panel=settings')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de perfil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 px-1.5 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            width={32}
            height={32}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm md:text-base font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
          {user.role && (
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
          )}
        </div>
        <FiChevronDown
          className={`h-3 w-3 md:h-4 md:w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
            {user.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiUser className="h-4 w-4" />
              <span>{t('myProfile')}</span>
            </button>

            <button
              onClick={handleMessages}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiMessageSquare className="h-4 w-4" />
              <span>{t('messages')}</span>
            </button>

            <button
              onClick={handleNotifications}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="relative">
                <FiBell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[12px] h-3 px-1 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>{t('notifications')}</span>
              {unreadCount > 0 && (
                <span className="ml-auto text-xs font-semibold text-red-600 dark:text-red-400">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiSettings className="h-4 w-4" />
              <span>{t('settings')}</span>
            </button>
          </div>

          {/* Language Switcher */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <LanguageSwitcher />
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <FiLogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
