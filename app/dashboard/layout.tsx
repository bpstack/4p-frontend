// app/dashboard/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import SideNav from '@/app/ui/dashboard/sidenav'
import { FiMenu, FiX, FiChevronRight, FiHome } from 'react-icons/fi'
import { GlobalSearch } from '@/app/components/search/GlobalSearch'
import { SimpleThemeButton } from '@/app/components/theme/SetThemeButton'
import { useAuth } from '@/app/lib/auth/useAuth'
import ProfileDropdown from '@/app/components/layout/ProfileDropdown'
import { NotificationBell } from '@/app/components/notifications'
import { DashboardSkeleton } from '@/app/components/dashboard'
// Iconos para breadcrumb mobile
import {
  DocumentDuplicateIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline'
import { SlBookOpen } from 'react-icons/sl'
import { LiaParkingSolid } from 'react-icons/lia'
import { GiOfficeChair } from 'react-icons/gi'
import { CgDanger } from 'react-icons/cg'
import { MdPointOfSale } from 'react-icons/md'
import { IoIosRestaurant } from 'react-icons/io'
import { IconType } from 'react-icons'

// Mapeo de rutas a iconos (para breadcrumb mobile)
const routeIcons: Record<string, IconType | React.ComponentType<{ className?: string }>> = {
  // Main
  logbooks: SlBookOpen,
  parking: LiaParkingSolid,
  maintenance: Cog6ToothIcon,
  restaurant: IoIosRestaurant,
  conciliation: HomeModernIcon,
  groups: UserGroupIcon,
  blacklist: CgDanger,
  // Back office
  bo: GiOfficeChair,
  invoices: DocumentDuplicateIcon,
  // Cashier
  cashier: MdPointOfSale,
  hotel: MdPointOfSale,
  reports: DocumentDuplicateIcon,
  logs: DocumentDuplicateIcon,
  // Profile
  profile: UserIcon,
  settings: Cog6ToothIcon,
  notifications: UserIcon,
  messages: UserIcon,
  // Parking subrutas
  bookings: LiaParkingSolid,
  status: LiaParkingSolid,
  // Acciones comunes
  new: DocumentDuplicateIcon,
  edit: Cog6ToothIcon,
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // ✅ Manejar mount para evitar hydration errors
  useEffect(() => {
    setMounted(true)
    // Limpiar atributos de extensiones que causan hydration errors
    document.body.removeAttribute('cz-shortcut-listen')
  }, [])

  // ✅ Manejar redirección cuando no hay usuario (con delay para evitar race conditions)
  useEffect(() => {
    // Solo verificar después de montar y cuando loading haya terminado
    if (!mounted || loading || redirecting) return

    // Si no hay usuario después de cargar, esperar un momento y verificar tokens
    if (!user) {
      // Sin usuario tras cargar: redirigir al login (middleware protege server-side)
      console.log('[DashboardLayout] ❌ No user, redirecting to login')
      setRedirecting(true)
      window.location.href = '/login'
    }
  }, [mounted, loading, user, redirecting])

  // ❌ REMOVIDO: No necesitamos redirigir aquí, el middleware ya lo hace
  // El middleware se encarga de proteger /dashboard
  // Si llegamos aquí, es porque el middleware ya verificó el token

  // Generamos breadcrumbs desde la ruta actual
  const generateBreadcrumbs = (): Array<{ label: string; href: string; isLast: boolean }> => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ label: string; href: string; isLast: boolean }> = []
    let currentPath = ''

    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: index === paths.length - 1,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // ✅ Mostrar skeleton mientras se carga el usuario
  if (!mounted || loading) {
    return <DashboardSkeleton />
  }

  // ✅ Si no hay usuario después de cargar, mostrar skeleton (el useEffect manejará la redirección)
  if (!user) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#010409] antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SideNav onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#010409] flex items-center justify-between px-4 md:px-6">
          {/* Left Section: Mobile Menu Button + Breadcrumb Navigation */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide min-w-0">
              {breadcrumbs.map((crumb, index) => {
                const isDashboard = crumb.label.toLowerCase() === 'dashboard'
                // Obtener el segmento de ruta para buscar el icono
                const pathSegment = crumb.href.split('/').filter(Boolean).pop() || ''
                const RouteIcon = routeIcons[pathSegment.toLowerCase()]

                return (
                  <div
                    key={crumb.href}
                    className="flex items-center gap-0.5 md:gap-1 flex-shrink-0"
                  >
                    {index > 0 && (
                      <FiChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                    )}
                    {isDashboard ? (
                      <Link
                        href={crumb.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-1.5 md:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {/* Mobile: icono home, Desktop: texto */}
                        <FiHome className="h-3.5 w-3.5 md:hidden" />
                        <span className="hidden md:inline">{crumb.label}</span>
                      </Link>
                    ) : crumb.isLast ? (
                      <span
                        className={`text-sm font-medium text-gray-900 dark:text-white px-1.5 md:px-2 py-1 truncate ${RouteIcon ? 'flex items-center gap-1' : ''}`}
                      >
                        {/* Mobile: icono si existe, Desktop: solo texto */}
                        {RouteIcon && <RouteIcon className="h-4 w-4 md:h-5 md:w-5 md:hidden" />}
                        <span className={RouteIcon ? 'hidden md:inline' : ''}>{crumb.label}</span>
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className={`text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-1.5 md:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate ${RouteIcon ? 'flex items-center gap-1' : ''}`}
                      >
                        {/* Mobile: icono si existe, Desktop: texto */}
                        {RouteIcon && <RouteIcon className="h-3.5 w-3.5 md:h-4 md:w-4 md:hidden" />}
                        <span className={RouteIcon ? 'hidden md:inline' : ''}>{crumb.label}</span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            {/* Search Bar - Hidden on mobile, visible on md+ */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            {/* Theme Toggle */}
            <SimpleThemeButton />

            {/* Notifications - Always visible */}
            <NotificationBell />

            {/* User Avatar - Always visible */}
            <ProfileDropdown />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#010409]">
          <div className="w-full p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
