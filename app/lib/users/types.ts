// app/lib/users/types.ts

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'recepcionist' | string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  role: string
}

export interface UpdateUserData {
  username?: string
  email?: string
  role?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}
