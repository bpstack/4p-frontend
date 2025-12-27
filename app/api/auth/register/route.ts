// app/api/auth/register/route.ts
/**
 * API Route Proxy para registrar nuevos usuarios
 * PROTEGIDO: Solo admins pueden crear usuarios
 * Lee el access_token de cookies y lo reenvía al backend
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
    // Obtener token de autenticación (requerido - solo admins)
    const accessToken = req.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado, falta token' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type debe ser application/json' }, { status: 400 })
    }

    const body = await req.json()
    if (!body?.username || !body?.password) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }
    console.log('[POST /api/auth/register] Admin creando usuario:', body.username)

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      const message = data?.error ?? data?.message ?? 'Error registrando'
      return NextResponse.json({ error: message }, { status: backendRes.status })
    }

    if (!data) {
      return NextResponse.json({ error: 'Respuesta inválida del backend' }, { status: 502 })
    }

    return NextResponse.json(data, { status: backendRes.status })
  } catch (error) {
    console.error('[POST /api/auth/register] Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
