// app/lib/users/queries.ts

import { apiClient } from '@/app/lib/apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type { LoginCredentials, RegisterData, UpdateUserData, AuthResponse } from './types'

const API_URL = API_BASE_URL

// =============== USERS API ===============

export const usersApi = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      return await apiClient.get(`${API_URL}/api/users`)
    } catch (err: unknown) {
      console.error('Error en getAllUsers:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      const message =
        errorMessage.includes('401') || errorMessage.includes('403')
          ? 'Failed to fetch users. This option is only available for administrators.'
          : 'Error fetching users. Please try again later.'
      return { error: message }
    }
  },

  // Obtener usuario por ID
  getUserById: async (id: string) => {
    return apiClient.get(`${API_URL}/api/users/${id}`)
  },

  // Obtener usuarios por rol
  getUsersByRole: async (role: string) => {
    return apiClient.get(`${API_URL}/api/users/role/${role}`)
  },

  // Actualizar usuario
  updateUser: async (id: string, data: UpdateUserData) => {
    return apiClient.put(`${API_URL}/api/users/${id}`, data)
  },

  // Eliminar usuario
  deleteUser: async (id: string) => {
    return apiClient.delete(`${API_URL}/api/users/${id}`)
  },
}

// =============== AUTH API ===============

export const authApi = {
  // Login - No usa apiClient porque no requiere auth previa
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(errorData?.message || 'Failed to login')
    }

    return res.json()
  },

  // Registro - No usa apiClient porque no requiere auth previa
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(errorData?.message || 'Failed to register')
    }

    return res.json()
  },

  // Obtener datos del usuario autenticado
  getMe: async () => {
    return apiClient.get(`${API_URL}/api/auth/me`)
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post(`${API_URL}/api/auth/refresh-token`, undefined, {
      skipRefresh: true, // Evitar loop infinito
    })
  },

  // Logout
  logout: async () => {
    return apiClient.post(`${API_URL}/api/auth/logout`)
  },
}
