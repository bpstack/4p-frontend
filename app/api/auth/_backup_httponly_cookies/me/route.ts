import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    const refreshToken = req.cookies.get('refresh_token')?.value

    console.log('[/api/auth/me] 🍪 Cookies presentes:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    })

    // 🚨 Si no hay ningún token, salir sin intentar refresh
    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const cookieHeader = [
      accessToken && `access_token=${accessToken}`,
      refreshToken && `refresh_token=${refreshToken}`,
    ]
      .filter(Boolean)
      .join('; ')

    const backendRes = await fetch('http://localhost:4000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      credentials: 'include',
    })

    if (backendRes.status === 401 || backendRes.status === 403) {
      console.log('[/api/auth/me] ⚠️ Token expirado o inválido, cliente debería refrescar')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!backendRes.ok) {
      console.error('[/api/auth/me] ❌ Error del backend:', backendRes.status)
      return NextResponse.json({ error: 'Backend error' }, { status: backendRes.status })
    }

    const data = await backendRes.json()
    console.log('[/api/auth/me] ✅ Usuario autenticado:', data?.user?.username)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[/api/auth/me] 💥 Error inesperado:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
