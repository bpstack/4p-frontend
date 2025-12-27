// app/api/auth/login/route.ts
/**
 * API Route Proxy para login
 * Recibe credenciales, las envía al backend y configura cookies HttpOnly
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
    // Extra safety: ensure content-type and basic shape
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type debe ser application/json' }, { status: 400 })
    }

    const body = await req.json()
    if (!body?.username || !body?.password) {
      return NextResponse.json({ error: 'Credenciales incompletas' }, { status: 400 })
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store',
    })

    const data = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      const message = data?.error ?? data?.message ?? 'Error autenticando'
      return NextResponse.json({ error: message }, { status: backendRes.status })
    }

    if (!data?.user || !data?.token) {
      return NextResponse.json({ error: 'Respuesta inválida del backend' }, { status: 502 })
    }

    // Crear respuesta con cookies HttpOnly
    const response = NextResponse.json({
      success: true,
      user: data.user,
    })

    // Configurar cookies HttpOnly
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
    console.error('[/api/auth/login] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
