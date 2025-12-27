// app/lib/auth/useAuth.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authLogin } from './authService'
import type { User } from '@/app/lib/logbooks/types'

const DEV_MODE = false

const DEV_USER: User = {
  id: 'dev-uuid-12345',
  username: 'Dev-user',
  email: 'dev@example.com',
  role: 'developer',
  avatar_url: null,
}

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/forgot-password',
  '/login',
  '/register',
]

// ========================================
// FUNCIÓN HELPER PARA FORMATEAR USERNAME
// ========================================
function formatUsername(username: string): string {
  if (!username) return username
  return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
}

// ========================================
// TIPOS
// ========================================
interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// ========================================
// CONTEXTO
// ========================================
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ========================================
// PROVIDER
// ========================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  /**
   * Función interna para obtener datos del usuario desde el backend
   * Reutilizada por checkSession y refreshUser
   */
  const fetchUserData = useCallback(async (): Promise<User | null> => {
    if (DEV_MODE) {
      return DEV_USER
    }

    try {
      const me = await authLogin.me()
      return {
        ...me,
        username: formatUsername(me.username),
      }
    } catch {
      return null
    }
  }, [])

  /**
   * Verificar sesión al inicializar o cambiar de ruta
   * Solo se ejecuta en rutas protegidas
   */
  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      // En rutas públicas, no verificar sesión
      if (PUBLIC_ROUTES.includes(pathname)) {
        if (isMounted) setLoading(false)
        return
      }

      // Si ya tenemos usuario, no volver a verificar
      if (user) {
        if (isMounted) setLoading(false)
        return
      }

      const userData = await fetchUserData()

      // Solo actualizar estado si el componente sigue montado
      if (!isMounted) {
        return
      }

      setUser(userData)
      setLoading(false)
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [pathname, fetchUserData, user])

  /**
   * Login de usuario
   */
  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true)

      try {
        if (DEV_MODE) {
          setUser(DEV_USER)
          setLoading(false)
          router.push('/dashboard')
          return
        }

        const data = await authLogin.login(username, password)

        setUser({
          ...data.user,
          username: formatUsername(data.user.username),
        })
        setLoading(false)

        const searchParams = new URLSearchParams(window.location.search)
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
        router.push(callbackUrl)
      } catch (error) {
        setLoading(false)
        throw error
      }
    },
    [router]
  )

  /**
   * Logout de usuario
   */
  const logout = useCallback(async () => {
    setLoading(true)

    try {
      if (!DEV_MODE) {
        await authLogin.logout()
      }
    } catch (error) {
      console.error('[useAuth] Error en logout:', error)
    } finally {
      setUser(null)
      setLoading(false)
      router.replace('/')
    }
  }, [router])

  /**
   * Refrescar datos del usuario actual
   * Útil después de actualizar el perfil
   */
  const refreshUser = useCallback(async () => {
    const userData = await fetchUserData()
    if (userData) {
      setUser(userData)
    }
  }, [fetchUserData])

  // Memoizar el value para evitar re-renders innecesarios
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ========================================
// HOOK
// ========================================
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }

  return context
}

// Alias para compatibilidad
export const useAuthContext = useAuth
