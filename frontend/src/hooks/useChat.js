// hooks/useChat.js
import { useEffect, useRef } from 'react'
import { useChatStore } from '@stores/useChatStore'
import { useAuthStore } from '@stores/useAuthStore'

export const useChat = (selectedUser) => {
  const {
    messagesByUser,
    getMessages,
    subscribeToChatEvents,
    markMessagesAsRead,
  } = useChatStore()
  const { authUser } = useAuthStore()
  const messageEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const messages = messagesByUser[selectedUser?._id] || []

  const messageImages = messages
    .filter((msg) => msg.image)
    .flatMap((msg) => msg.image)

  useEffect(() => {
    if (selectedUser?._id) {
      markMessagesAsRead(selectedUser._id)
      getMessages(selectedUser._id)
      subscribeToChatEvents()
    }

    return () => {
      const socket = useAuthStore.getState().socket
      socket.off('newMessage')
      socket.off('messagesRead')
    }
  }, [selectedUser?._id, getMessages, subscribeToChatEvents, markMessagesAsRead])

  // Scroll automatique
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return {
    messages,
    authUser,
    messageImages,
    messageEndRef,
    messagesContainerRef,
  }
}