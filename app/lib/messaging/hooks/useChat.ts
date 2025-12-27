// lib/messaging/hooks/useChat.ts

import { useState, useCallback, useEffect, useRef } from 'react'
import { getMessages, sendMessage, editMessage, deleteMessage } from '../queries'
import type { Message, SendMessageRequest } from '../types'

interface UseChatOptions {
  conversationId: number | null
  onMessageSent?: (message: Message) => void
}

export function useChat(options: UseChatOptions) {
  const { conversationId, onMessageSent } = options

  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch messages
  const fetchMessages = useCallback(
    async (before?: number) => {
      if (!conversationId) return

      try {
        setLoading(true)
        setError(null)
        const response = await getMessages(conversationId, { before, limit: 50 })

        if (before) {
          // Prepend older messages
          setMessages((prev) => [...response.data, ...prev])
        } else {
          setMessages(response.data)
        }

        setHasMore(response.has_more)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar mensajes'
        setError(message)
        console.error('Error fetching messages:', err)
      } finally {
        setLoading(false)
      }
    },
    [conversationId]
  )

  // Send message
  const send = useCallback(
    async (content: string, notify = false) => {
      if (!conversationId || !content.trim() || sending) return null

      try {
        setSending(true)
        const data: SendMessageRequest = { content: content.trim(), notify }
        const message = await sendMessage(conversationId, data)

        setMessages((prev) => [...prev, message])
        onMessageSent?.(message)

        return message
      } catch (err) {
        console.error('Error sending message:', err)
        throw err
      } finally {
        setSending(false)
      }
    },
    [conversationId, sending, onMessageSent]
  )

  // Edit message
  const edit = useCallback(async (messageId: number, content: string) => {
    if (!content.trim()) return

    try {
      const updated = await editMessage(messageId, { content: content.trim() })
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)))
      cancelEdit()
    } catch (err) {
      console.error('Error editing message:', err)
      throw err
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Delete message
  const remove = useCallback(async (messageId: number) => {
    try {
      await deleteMessage(messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (err) {
      console.error('Error deleting message:', err)
      throw err
    }
  }, [])

  // Start editing
  const startEdit = useCallback((message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }, [])

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingMessageId(null)
    setEditContent('')
  }, [])

  // Load more (older messages)
  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore && !loading) {
      fetchMessages(messages[0].id)
    }
  }, [messages, hasMore, loading, fetchMessages])

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])

  // Clear messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      setMessages([])
      setHasMore(false)
      setError(null)
      cancelEdit()
      fetchMessages()
    }
  }, [conversationId, fetchMessages, cancelEdit])

  return {
    // State
    messages,
    loading,
    sending,
    hasMore,
    error,

    // Edit state
    editingMessageId,
    editContent,
    setEditContent,

    // Actions
    send,
    edit,
    remove,
    loadMore,
    startEdit,
    cancelEdit,
    scrollToBottom,
    refetch: fetchMessages,

    // Refs
    messagesEndRef,
    containerRef,
  }
}
