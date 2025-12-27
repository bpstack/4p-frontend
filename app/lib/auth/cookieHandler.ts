// app/lib/auth/cookieHandler.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

/**
 * Helper para manejar cookies consistentemente en todos los endpoints
 */
export const cookieHandler = {
  /**
   * Copia TODAS las cookies Set-Cookie de una respuesta fetch a una NextResponse
   * CRÍTICO: res.headers.get('set-cookie') solo devuelve 1 cookie si hay múltiples
   * Necesitamos usar getSetCookie() o headers.raw() para obtener todas
   */
  copySetCookies: (sourceResponse: Response, targetResponse: NextResponse) => {
    // Obtener TODAS las cookies Set-Cookie (puede haber múltiples)
    const setCookies = sourceResponse.headers.getSetCookie?.() || []

    if (setCookies.length === 0) {
      // Fallback para navegadores antiguos
      const setCookieHeader = sourceResponse.headers.get('set-cookie')
      if (setCookieHeader) {
        setCookies.push(setCookieHeader)
      }
    }

    console.log(`[cookieHandler] 🔄 Copiando ${setCookies.length} cookies del backend`)

    // Aplicar cada cookie individualmente
    setCookies.forEach((cookie, index) => {
      targetResponse.headers.append('set-cookie', cookie)
      // Log breve de cada cookie (sin el valor completo por seguridad)
      const cookieName = cookie.split('=')[0]
      console.log(`[cookieHandler] ✅ Cookie ${index + 1}: ${cookieName}`)
    })

    return targetResponse
  },

  /**
   * Limpia las cookies de autenticación
   */
  clearAuthCookies: (response: NextResponse) => {
    console.log('[cookieHandler] 🧹 Limpiando cookies de autenticación')

    // ✅ CORREGIDO: Usar la interfaz correcta de Next.js para cookies
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 0,
    }

    response.cookies.set('access_token', '', cookieOptions)
    response.cookies.set('refresh_token', '', cookieOptions)

    console.log('[cookieHandler] ✅ Cookies limpiadas')
    return response
  },

  /**
   * Extrae el header Cookie del request para reenviar al backend
   */
  getCookieHeader: (request: NextRequest) => {
    const cookies = request.cookies.getAll()
    const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')

    console.log(`[cookieHandler] 📨 Obtenidas ${cookies.length} cookies del request`)

    // Debug: mostrar nombres de cookies (sin valores por seguridad)
    const cookieNames = cookies.map((c) => c.name)
    console.log(`[cookieHandler] 📋 Nombres de cookies: ${cookieNames.join(', ')}`)

    return cookieHeader
  },
}
