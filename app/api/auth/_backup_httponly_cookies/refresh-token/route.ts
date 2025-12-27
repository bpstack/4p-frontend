import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('[/api/auth/refresh-token] 🔄 Intentando refrescar token...')

    const refreshToken = req.cookies.get('refresh_token')?.value
    const accessToken = req.cookies.get('access_token')?.value

    if (!refreshToken) {
      console.log('[/api/auth/refresh-token] ❌ No hay refresh token')
      const resp = NextResponse.json({ error: 'No refresh token' }, { status: 401 })
      resp.cookies.delete('access_token')
      resp.cookies.delete('refresh_token')
      return resp
    }

    const cookieHeader = [
      accessToken && `access_token=${accessToken}`,
      refreshToken && `refresh_token=${refreshToken}`,
    ]
      .filter(Boolean)
      .join('; ')

    const backendResponse = await fetch('http://localhost:4000/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      credentials: 'include',
    })

    const data = await backendResponse.json().catch(() => ({}))

    if (!backendResponse.ok) {
      console.log('[/api/auth/refresh-token] ❌ Backend rechazó refresh:', data)
      const resp = NextResponse.json(data, { status: backendResponse.status })
      resp.cookies.delete('access_token')
      resp.cookies.delete('refresh_token')
      return resp
    }

    const response = NextResponse.json(data, { status: 200 })

    // Copiar cookies nuevas del backend
    const rawCookies = backendResponse.headers.get('set-cookie')
    if (rawCookies) {
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
    }

    console.log('[/api/auth/refresh-token] ✅ Tokens actualizados correctamente')
    return response
  } catch (error) {
    console.error('[/api/auth/refresh-token] 💥 Error:', error)
    const resp = NextResponse.json({ error: 'Internal error' }, { status: 500 })
    resp.cookies.delete('access_token')
    resp.cookies.delete('refresh_token')
    return resp
  }
}
