// app/lib/auth/authService.ts
'use client'

/**
 * Servicio de autenticación
 * Solo flujo de cookies HttpOnly. El backend setea/borrra cookies.
 */

import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'

const isDev = process.env.NODE_ENV === 'development'

const API_BASE = `${API_BASE_URL}/api/auth`

export const authLogin = {
  login: async (username: string, password: string) => {
    console.log(`[authLogin.login] Iniciando para: ${username} (${isDev ? 'DEV' : 'PROD'})`)

    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      const message = data?.error || data?.message || 'Login failed'
      throw new Error(message)
    }

    const data = await res.json()
    console.log('[authLogin.login] Login exitoso:', data.user.username)
    return data
  },

  logout: async () => {
    console.log(`[authLogin.logout] Cerrando sesión... (${isDev ? 'DEV' : 'PROD'})`)

    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })
      console.log('[authLogin.logout] Sesión cerrada')
    } catch (error) {
      console.error('[authLogin.logout] Error al notificar backend:', error)
    }
  },

  me: async () => {
    console.log(`[authLogin.me] Obteniendo usuario actual... (${isDev ? 'DEV' : 'PROD'})`)

    // Usa apiClient con auto-refresh (cookies HttpOnly)
    const data = await apiClient.get<{ user: { username: string; id: string; role: string } }>(
      `${API_BASE}/me`
    )
    console.log('[authLogin.me] Usuario obtenido:', data.user.username)
    return data.user
  },

  // Ya no se sincronizan tokens en cliente; solo cookies HttpOnly del backend
  syncTokensToCookies: () => undefined,
}
