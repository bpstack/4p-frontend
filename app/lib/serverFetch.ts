// app/lib/serverFetch.ts
// Server-side fetch utility with cookie forwarding for SSR

import { cookies } from 'next/headers'
import { SERVER_API_BASE_URL } from '@/app/lib/env'

/**
 * Server-side fetch that forwards authentication cookies
 * Use this in Server Components for authenticated API calls
 */
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    // If no token, return null (user not authenticated)
    if (!accessToken) {
      console.log('[serverFetch] No access_token cookie found')
      return null
    }

    const url = `${SERVER_API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `access_token=${accessToken}`,
        ...options.headers,
      },
      // Don't cache authenticated requests by default
      cache: 'no-store',
    })

    if (!response.ok) {
      console.log(`[serverFetch] ${endpoint} failed: ${response.status}`)
      return null
    }

    return response.json()
  } catch (error) {
    console.error('[serverFetch] Error:', error)
    return null
  }
}

/**
 * Server-side fetch for static/public data (no auth required)
 * Can be cached
 */
export async function serverFetchPublic<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const url = `${SERVER_API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      console.log(`[serverFetchPublic] ${endpoint} failed: ${response.status}`)
      return null
    }

    return response.json()
  } catch (error) {
    console.error('[serverFetchPublic] Error:', error)
    return null
  }
}
