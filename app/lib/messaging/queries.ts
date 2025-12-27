// app/lib/messaging/queries.ts

import { apiClient } from '../apiClient'
import { API_BASE_URL } from '@/app/lib/env'
import type {
  Conversation,
  ConversationWithParticipants,
  Message,
  UserSearchResult,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  AddParticipantsRequest,
  ApiResponse,
  MessagesResponse,
  UnreadCountResponse,
} from './types'

const API_URL = API_BASE_URL

// ===============================================
// CONVERSATIONS
// ===============================================

/**
 * Obtener mis conversaciones
 */
export async function getConversations(): Promise<Conversation[]> {
  const response: ApiResponse<Conversation[]> = await apiClient.get(
    `${API_URL}/api/messages/conversations`
  )
  return response.data || []
}

/**
 * Obtener detalle de una conversacion
 */
export async function getConversation(id: number): Promise<ConversationWithParticipants | null> {
  const response: ApiResponse<ConversationWithParticipants> = await apiClient.get(
    `${API_URL}/api/messages/conversations/${id}`
  )
  return response.data || null
}

/**
 * Crear nueva conversacion (DM o grupo)
 */
export async function createConversation(
  data: CreateConversationRequest
): Promise<{ conversation: Conversation; existing?: boolean }> {
  const response = await apiClient.post<{ data: Conversation; existing?: boolean }>(
    `${API_URL}/api/messages/conversations`,
    data
  )
  return {
    conversation: response.data,
    existing: response.existing || false,
  }
}

/**
 * Actualizar conversacion (nombre del grupo)
 */
export async function updateConversation(id: number, name: string): Promise<Conversation> {
  const response: ApiResponse<Conversation> = await apiClient.patch(
    `${API_URL}/api/messages/conversations/${id}`,
    { name }
  )
  return response.data!
}

/**
 * Salir de una conversacion
 */
export async function leaveConversation(id: number): Promise<void> {
  await apiClient.delete(`${API_URL}/api/messages/conversations/${id}`)
}

/**
 * Eliminar conversacion completa (solo admin de la conversacion o admin del sistema)
 */
export async function deleteConversation(id: number): Promise<void> {
  await apiClient.delete(`${API_URL}/api/messages/conversations/${id}/delete`)
}

/**
 * Marcar conversacion como leida
 */
export async function markConversationAsRead(id: number): Promise<void> {
  await apiClient.post(`${API_URL}/api/messages/conversations/${id}/read`)
}

// ===============================================
// PARTICIPANTS
// ===============================================

/**
 * Añadir participantes a un grupo
 */
export async function addParticipants(
  conversationId: number,
  data: AddParticipantsRequest
): Promise<void> {
  await apiClient.post(`${API_URL}/api/messages/conversations/${conversationId}/participants`, data)
}

/**
 * Remover participante de un grupo
 */
export async function removeParticipant(conversationId: number, userId: string): Promise<void> {
  await apiClient.delete(
    `${API_URL}/api/messages/conversations/${conversationId}/participants/${userId}`
  )
}

// ===============================================
// MESSAGES
// ===============================================

/**
 * Obtener mensajes de una conversacion
 */
export async function getMessages(
  conversationId: number,
  options?: { before?: number; limit?: number }
): Promise<MessagesResponse> {
  const params = new URLSearchParams()
  if (options?.before) params.append('before', options.before.toString())
  if (options?.limit) params.append('limit', options.limit.toString())

  const queryString = params.toString()
  const url = `${API_URL}/api/messages/conversations/${conversationId}/messages${
    queryString ? `?${queryString}` : ''
  }`

  return await apiClient.get(url)
}

/**
 * Enviar mensaje
 */
export async function sendMessage(
  conversationId: number,
  data: SendMessageRequest
): Promise<Message> {
  const response: ApiResponse<Message> = await apiClient.post(
    `${API_URL}/api/messages/conversations/${conversationId}/messages`,
    data
  )
  return response.data!
}

/**
 * Editar mensaje
 */
export async function editMessage(messageId: number, data: UpdateMessageRequest): Promise<Message> {
  const response: ApiResponse<Message> = await apiClient.patch(
    `${API_URL}/api/messages/${messageId}`,
    data
  )
  return response.data!
}

/**
 * Eliminar mensaje
 */
export async function deleteMessage(messageId: number): Promise<void> {
  await apiClient.delete(`${API_URL}/api/messages/${messageId}`)
}

// ===============================================
// UNREAD & SEARCH
// ===============================================

/**
 * Obtener contador de no leidos
 */
export async function getUnreadCount(): Promise<UnreadCountResponse['data']> {
  const response: UnreadCountResponse = await apiClient.get(`${API_URL}/api/messages/unread-count`)
  return response.data
}

/**
 * Buscar en mensajes
 */
export async function searchMessages(query: string, limit?: number): Promise<Message[]> {
  const params = new URLSearchParams({ q: query })
  if (limit) params.append('limit', limit.toString())

  const response: ApiResponse<Message[]> = await apiClient.get(
    `${API_URL}/api/messages/search?${params.toString()}`
  )
  return response.data || []
}

// ===============================================
// USERS
// ===============================================

/**
 * Buscar usuarios para iniciar conversacion
 */
export async function searchUsers(query?: string): Promise<UserSearchResult[]> {
  const url = query
    ? `${API_URL}/api/messages/users?q=${encodeURIComponent(query)}`
    : `${API_URL}/api/messages/users`

  const response: ApiResponse<UserSearchResult[]> = await apiClient.get(url)
  return response.data || []
}

// ===============================================
// ADMIN
// ===============================================

/**
 * Obtener todas las conversaciones (solo admin)
 */
export async function getAllConversations(limit?: number): Promise<Conversation[]> {
  const url = limit
    ? `${API_URL}/api/messages/conversations/all?limit=${limit}`
    : `${API_URL}/api/messages/conversations/all`

  const response: ApiResponse<Conversation[]> = await apiClient.get(url)
  return response.data || []
}
