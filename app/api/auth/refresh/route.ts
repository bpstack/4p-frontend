// app/api/auth/refresh/route.ts
/**
 * API Route Proxy para refresh token
 * Lee el refresh_token de cookies, obtiene nuevos tokens del backend
 * y actualiza las cookies HttpOnly
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

  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    const accessToken = req.cookies.get('access_token')?.value

    console.log('[/api/auth/refresh] Cookies recibidas:', {
      hasRefreshToken: !!refreshToken,
      hasAccessToken: !!accessToken,
      refreshTokenLength: refreshToken?.length || 0,
    })

    if (!refreshToken) {
      console.log('[/api/auth/refresh] ❌ No hay refresh_token en cookies')
      return NextResponse.json({ error: 'No hay refresh token' }, { status: 401 })
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    const data = await backendRes.json().catch(() => null)

    console.log('[/api/auth/refresh] Backend response:', {
      status: backendRes.status,
      hasToken: !!data?.token,
      hasRefreshToken: !!data?.refreshToken,
    })

    if (!backendRes.ok) {
      const message = data?.error ?? data?.message ?? 'Sesion expirada'
      const response = NextResponse.json({ error: message }, { status: 401 })
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      return response
    }

    if (!data?.token) {
      const response = NextResponse.json(
        { error: 'Respuesta inválida del backend' },
        { status: 502 }
      )
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      return response
    }

    const response = NextResponse.json({ success: true })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }

    response.cookies.set('access_token', data.token, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutos
    })

    if (data.refreshToken) {
      response.cookies.set('refresh_token', data.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60, // 7 días (debe coincidir con backend)
      })
    }

    return response
  } catch (error) {
    console.error('[/api/auth/refresh] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
