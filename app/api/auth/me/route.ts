// app/api/auth/me/route.ts
/**
 * API Route Proxy para obtener usuario actual
 * Lee el access_token de cookies y consulta al backend
 */

import { NextRequest, NextResponse } from 'next/server'

import { SERVER_API_BASE_URL } from '@/app/lib/env'

const BACKEND_URL = SERVER_API_BASE_URL

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
  ].filter(Boolean)
  if (origin && !allowedOrigins.some((o) => o && origin.startsWith(o))) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  try {
    const accessToken = req.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      const message = data?.error ?? data?.message ?? 'No autenticado'
      return NextResponse.json({ error: message }, { status: backendRes.status })
    }

    if (!data?.user) {
      return NextResponse.json({ error: 'Respuesta inválida del backend' }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/auth/me] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
