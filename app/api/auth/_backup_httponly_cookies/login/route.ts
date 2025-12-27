// app/api/auth/login/route.ts
// Proxy que maneja correctamente las cookies del backend

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[/api/auth/login] Iniciando login para:', body.username)

    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    console.log('[/api/auth/login] Status del backend:', res.status)
    const data = await res.json()

    if (!res.ok) {
      console.log('[/api/auth/login] ❌ Error del backend:', data)
      return NextResponse.json(data, { status: res.status })
    }

    const response = NextResponse.json(data, { status: 200 })

    // 🔹 Copiar cookies del backend al dominio frontend
    const rawCookies = res.headers.get('set-cookie')
    if (!rawCookies) {
      console.error('[/api/auth/login] ❌ Backend no devolvió cookies')
      return response
    }

    const cookieList = rawCookies.split(/,(?=\s*[a-zA-Z0-9_\-]+=)/)

    cookieList.forEach((cookieString) => {
      const [nameValue] = cookieString.split(';')
      const [name, value] = nameValue.split('=')
      if (!name || !value) return

      if (name === 'access_token') {
        response.cookies.set('access_token', value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60,
        })
      }

      if (name === 'refresh_token') {
        response.cookies.set('refresh_token', value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 8 * 60 * 60,
        })
      }
    })

    console.log('[/api/auth/login] ✅ Cookies configuradas correctamente')
    return response
  } catch (error) {
    console.error('[/api/auth/login] 💥 Error inesperado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
