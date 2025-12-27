// app/api/auth/logout/route.ts
// proxy - target --> do not expose backend URL in frontend neither cookies

// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookieHandler } from '@/app/lib/auth/cookieHandler'

export async function POST(request: NextRequest) {
  try {
    console.log('[/api/auth/logout] Cerrando sesión...')
    const cookieHeader = cookieHandler.getCookieHeader(request)

    const res = await fetch('http://localhost:4000/api/auth/logout', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      credentials: 'include',
    })

    const data = await res.json().catch(() => ({ success: true }))
    const response = NextResponse.json(data, { status: res.status })

    // ✅ SIEMPRE limpiar cookies (éxito o error)
    cookieHandler.clearAuthCookies(response)
    console.log('[/api/auth/logout] Sesión cerrada, cookies limpiadas')

    return response
  } catch (error) {
    console.error('[/api/auth/logout] Error:', error)
    const response = NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    cookieHandler.clearAuthCookies(response)
    return response
  }
}
