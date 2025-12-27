// proxy.ts - Route protection (Next.js 16+)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin']
const authRoutes = ['/login', '/register', '/forgot-password']

/**
 * Decodifica un JWT sin verificar firma (solo para leer el payload)
 * Retorna null si el token es invalido o no se puede decodificar
 */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Decodificar base64url a base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload
  } catch {
    return null
  }
}

/**
 * Verifica si un token JWT esta expirado
 * Retorna true si esta expirado o es invalido
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true

  // Agregar margen de 30 segundos para evitar edge cases
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now + 30
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip internal routes and static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // Verificar autenticacion:
  // - Tiene access_token valido (no expirado), O
  // - Tiene refresh_token (el cliente puede renovar el access_token)
  const hasValidAccessToken = accessToken && !isTokenExpired(accessToken)
  const canRefresh = !!refreshToken
  const isAuthenticated = hasValidAccessToken || canRefresh

  // ============================================
  // 🏠 HOMEPAGE
  // ============================================
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // ============================================
  // 🔒 PROTEGER RUTAS PRIVADAS
  // ============================================
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ============================================
  // 🚫 EVITAR QUE USUARIOS AUTENTICADOS VEAN LOGIN/REGISTER
  // ============================================
  if (authRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
