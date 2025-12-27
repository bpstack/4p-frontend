// app/lib/messaging/types.ts

// ===============================================
// ENUMS
// ===============================================

export type ConversationType = 'dm' | 'group'

// ===============================================
// API RESPONSE TYPES
// ===============================================

export interface Conversation {
  id: number
  type: ConversationType
  name: string | null
  created_by: string
  created_at: string
  updated_at: string
  // Extended fields
  participant_count?: number
  last_message?: string
  last_message_at?: string
  unread_count?: number
  // For DMs
  other_user_id?: string
  other_username?: string
  other_role?: string
}

export interface Participant {
  id: number
  conversation_id: number
  user_id: string
  joined_at: string
  last_read_at: string | null
  is_admin: boolean
  is_active: boolean
  // Extended fields
  username: string
  email: string
  role_name?: string
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  content: string
  notify: boolean
  is_edited: boolean
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  // Extended fields
  sender_username: string
  sender_role?: string
}

export interface UserSearchResult {
  id: string
  username: string
  email: string
  role_name: string
  existing_dm_id?: number | null
}

// ===============================================
// REQUEST TYPES
// ===============================================

export interface CreateConversationRequest {
  type: ConversationType
  name?: string
  participant_ids: string[]
}

export interface SendMessageRequest {
  content: string
  notify?: boolean
}

export interface UpdateMessageRequest {
  content: string
}

export interface AddParticipantsRequest {
  user_ids: string[]
}

// ===============================================
// RESPONSE TYPES
// ===============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  count?: number
}

export interface ConversationWithParticipants extends Conversation {
  participants: Participant[]
}

export interface MessagesResponse {
  success: boolean
  data: Message[]
  has_more: boolean
  oldest_id: number | null
}

export interface UnreadCountResponse {
  success: boolean
  data: {
    total_unread: number
    by_conversation: {
      conversation_id: number
      unread_count: number
    }[]
  }
}

// ===============================================
// UI TYPES (para componentes)
// ===============================================

export interface ConversationListItem {
  id: number
  type: ConversationType
  name: string // Para DMs: username del otro usuario, para grupos: nombre del grupo
  avatar?: string
  lastMessage: string
  lastMessageTime: Date | null
  unreadCount: number
  isOnline?: boolean
  role?: string // Para DMs: rol del otro usuario
}

export interface ChatMessage {
  id: number
  content: string
  senderId: string
  senderName: string
  senderRole?: string
  timestamp: Date
  isOwn: boolean
  isEdited: boolean
  isDeleted: boolean
}
