// lib/messaging/hooks/useConversations.ts

import { useState, useCallback, useEffect } from 'react'
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  leaveConversation,
  markConversationAsRead,
} from '../queries'
import type {
  Conversation,
  ConversationWithParticipants,
  CreateConversationRequest,
} from '../types'

interface UseConversationsOptions {
  initialConversationId?: number | null
}

export function useConversations(options: UseConversationsOptions = {}) {
  const { initialConversationId } = options

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getConversations()
      setConversations(data)

      // Auto-select if initialConversationId provided
      if (initialConversationId) {
        const conv = data.find((c) => c.id === initialConversationId)
        if (conv) setSelectedConversation(conv)
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar conversaciones'
      setError(message)
      console.error('Error fetching conversations:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [initialConversationId])

  // Get conversation details with participants
  const getConversationDetails = useCallback(
    async (id: number): Promise<ConversationWithParticipants | null> => {
      try {
        return await getConversation(id)
      } catch (err) {
        console.error('Error fetching conversation details:', err)
        return null
      }
    },
    []
  )

  // Create new conversation
  const create = useCallback(async (data: CreateConversationRequest) => {
    try {
      const { conversation, existing } = await createConversation(data)

      if (!existing) {
        setConversations((prev) => [conversation, ...prev])
      }

      setSelectedConversation(conversation)
      return { conversation, existing }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear conversación'
      console.error('Error creating conversation:', err)
      throw new Error(message)
    }
  }, [])

  // Delete conversation
  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))

        if (selectedConversation?.id === id) {
          setSelectedConversation(null)
        }
      } catch (err) {
        console.error('Error deleting conversation:', err)
        throw err
      }
    },
    [selectedConversation?.id]
  )

  // Leave conversation (for groups)
  const leave = useCallback(
    async (id: number) => {
      try {
        await leaveConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))

        if (selectedConversation?.id === id) {
          setSelectedConversation(null)
        }
      } catch (err) {
        console.error('Error leaving conversation:', err)
        throw err
      }
    },
    [selectedConversation?.id]
  )

  // Mark as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await markConversationAsRead(id)
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)))
    } catch (err) {
      console.error('Error marking conversation as read:', err)
    }
  }, [])

  // Update conversation locally (for optimistic updates)
  const updateConversationLocal = useCallback((id: number, updates: Partial<Conversation>) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  // Select conversation
  const select = useCallback((conversation: Conversation | null) => {
    setSelectedConversation(conversation)
  }, [])

  // Total unread count
  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0)

  // Initial fetch
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    // State
    conversations,
    selectedConversation,
    loading,
    error,
    totalUnread,

    // Actions
    fetchConversations,
    getConversationDetails,
    create,
    remove,
    leave,
    markAsRead,
    select,
    updateConversationLocal,
  }
}
