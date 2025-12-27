// app/lib/logbooks/types.ts

// ========== TIPOS BASE DEL BACKEND ==========
export interface LogbookEntry {
  id: number
  author_id: string
  author_name?: string
  message: string
  importance_level: 'baja' | 'media' | 'alta' | 'urgente'
  department_id: number
  created_at?: string
  updated_at?: string
  is_solved?: number
  deleted_at?: string | null
  date?: string
}

export interface LogbookComment {
  id: number
  logbook_id: number
  user_id: string // Backend usa user_id
  author_name?: string
  comment: string
  importance_level: 'baja' | 'media' | 'alta' | 'urgente'
  department_id: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// ========== TIPOS PARA UI (FRONTEND) ==========
// Usamos alias para mantener compatibilidad
export type Comment = LogbookComment

export interface LogEntry {
  id: number
  timestamp: string
  description: string
  department: string // Nombre formateado
  department_id: number
  priority?: 'low' | 'medium' | 'high' | 'critical'
  readBy: string[]
  status?: 'pending' | 'resolved'
  comments?: Comment[]
  author_id?: string
  author_name?: string
  updated_at?: string
  is_edited?: boolean
}

// ========== DTOs ==========
export interface CreateLogbookDto {
  author_id: string
  message: string
  importance_level: 'baja' | 'media' | 'alta' | 'urgente'
  department_id: number
  date: string // formato YYYY-MM-DD
}

// ========== ENTIDADES AUXILIARES ==========
export interface Department {
  id: number
  name: string
}

export interface User {
  id: string
  username: string
  email?: string
  role?: string
  avatar_url?: string | null
}

// ========== HISTORIAL ==========
export interface LogbookHistory {
  id: number
  logbook_id: number
  action: string
  changes: string
  user_id: string
  created_at: string
}

export interface CommentHistory {
  id: number
  comment_id: number
  action: string
  changes: string
  user_id: string
  created_at: string
}
