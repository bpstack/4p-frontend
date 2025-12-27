// app/api/auth/logout/route.ts
/**
 * API Route Proxy para logout
 * Notifica al backend y limpia cookies HttpOnly
 */

import { NextRequest, NextResponse } from 'next/server'

import { SERVER_API_BASE_URL } from '@/app/lib/env'

const BACKEND_URL = SERVER_API_BASE_URL
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXTAUTH_URL,
  'http://localhost:3000',
].filter(Boolean)

const isAllowedOrigin = (origin: string | null) => {
  if (!origin) return true
  return ALLOWED_ORIGINS.some((allowed) => allowed && origin.startsWith(allowed))
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  const accessToken = req.cookies.get('access_token')?.value

  // Siempre limpiar cookies locales aunque no haya token
  const response = NextResponse.json({
    success: true,
    message: 'Sesion cerrada',
  })

  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')

  if (!accessToken) {
    return response
  }

  // Notificar al backend (opcional, puede fallar)
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      cache: 'no-store',
    })
  } catch (notifyError) {
    console.warn('[/api/auth/logout] Backend logout fallo (ignorado):', notifyError)
  }

  return response
}
