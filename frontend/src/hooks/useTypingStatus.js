// hooks/useTypingStatus.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { useChatStore } from '@stores/useChatStore'
import { useAuthStore } from '@stores/useAuthStore'

export const useTypingStatus = (selectedUser) => {
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const { authUser } = useAuthStore()
  const { socket } = useAuthStore()

  // Fonction pour envoyer le statut de saisie
  const sendTypingStatus = useCallback((isTypingValue) => {
    if (!socket || !selectedUser || !authUser) {
      console.log("Cannot send typing status: missing dependencies", {
        hasSocket: !!socket,
        hasSelectedUser: !!selectedUser,
        hasAuthUser: !!authUser
      })
      return
    }

    console.log(`Sending typing status: ${isTypingValue} to ${selectedUser._id}`)
    socket.emit('typing', {
      senderId: authUser._id,
      receiverId: selectedUser._id,
      isTyping: isTypingValue,
    })
  }, [socket, selectedUser, authUser])

  // Fonction appelée quand l'utilisateur commence à écrire
  const startTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    sendTypingStatus(true)

    // Auto-stop après 3 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false)
    }, 3000)
  }, [sendTypingStatus])

  // Fonction appelée quand l'utilisateur arrête d'écrire
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    sendTypingStatus(false)
  }, [sendTypingStatus])

  // Écouter les événements de typing
  useEffect(() => {
    if (!selectedUser || !authUser) return

    const handleTypingEvent = (event) => {
      const { senderId, receiverId, isTyping: isTypingValue } = event.detail
      console.log("Handling typing event:", { senderId, receiverId, isTypingValue, selectedUserId: selectedUser._id, authUserId: authUser._id })
      
      // Ne montrer l'indicateur que si c'est le selectedUser qui tape et que c'est pour moi
      if (senderId === selectedUser._id && receiverId === authUser._id) {
        console.log("Setting isTyping to:", isTypingValue)
        setIsTyping(isTypingValue)
        
        // Auto-cacher après 4 secondes si pas de nouveau signal
        if (isTypingValue) {
          if (window.typingTimeout) clearTimeout(window.typingTimeout)
          window.typingTimeout = setTimeout(() => {
            setIsTyping(false)
          }, 4000)
        }
      }
    }

    // Écouter l'événement personnalisé
    window.addEventListener('typing', handleTypingEvent)

    // Aussi écouter directement sur le socket si disponible
    const { socket } = useAuthStore.getState()
    if (socket) {
      const directHandler = (data) => {
        console.log("Direct socket typing event:", data)
        if (data.senderId === selectedUser._id && data.receiverId === authUser._id) {
          setIsTyping(data.isTyping)
          if (data.isTyping) {
            if (window.typingTimeout) clearTimeout(window.typingTimeout)
            window.typingTimeout = setTimeout(() => {
              setIsTyping(false)
            }, 4000)
          }
        }
      }
      socket.on('typing', directHandler)
      
      return () => {
        window.removeEventListener('typing', handleTypingEvent)
        socket.off('typing', directHandler)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        if (window.typingTimeout) clearTimeout(window.typingTimeout)
      }
    }

    return () => {
      window.removeEventListener('typing', handleTypingEvent)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (window.typingTimeout) clearTimeout(window.typingTimeout)
    }
  }, [selectedUser, authUser])

  return {
    isTyping,
    startTyping,
    stopTyping,
  }
}