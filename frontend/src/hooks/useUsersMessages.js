import { useEffect, useMemo } from 'react'
import { useChatStore } from '@stores/useChatStore'
import { useAuthStore } from '@stores/useAuthStore'
import { formatLastSeen, isRecentlyOnline } from '@lib/utils'

export const useUsersMessages = () => {
  const { getUsers, getMessages, users, messagesByUser, subscribeToChatEvents } = useChatStore()
  const { onlineUsers, authUser } = useAuthStore()

  // Charger les utilisateurs
  useEffect(() => {
    getUsers()
  }, [getUsers])

  // Charger les messages pour chaque utilisateur
  useEffect(() => {
    const loadUsersMessages = async () => {
      if (users.length > 0) {
        await Promise.all(users.map(user => getMessages(user._id)))
      }
    }
    loadUsersMessages()
  }, [users, getMessages])

  // S'abonner aux événements de chat
  useEffect(() => {
    subscribeToChatEvents()
  }, [subscribeToChatEvents])

  // Calculer les derniers messages
  const lastMessagesMap = useMemo(() => {
    const map = {}
    users.forEach(user => {
      const userMessages = messagesByUser[user._id] || []
      map[user._id] = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null
    })
    return map
  }, [messagesByUser, users])

  // Calculer les messages non lus
  const unreadCountsMap = useMemo(() => {
    const map = {}
    users.forEach(user => {
      const userMessages = messagesByUser[user._id] || []
      const unreadCount = userMessages.filter(msg =>
        msg.receiverId === authUser._id && !msg.read
      ).length
      map[user._id] = unreadCount
    })
    return map
  }, [messagesByUser, users])

  const userStatusMap = useMemo(() => {
    const map = {}
    users.forEach(user => {
      const isOnline = onlineUsers.includes(user._id)

      const lastSeenText = isOnline ? "En ligne" : formatLastSeen(user.lastSeen)

      const isRecentlyActive = isOnline || isRecentlyOnline(user.lastSeen, 2)

      map[user._id] = {
        isOnline,
        lastSeenText,
        isRecentlyActive,
        lastSeen: user.lastSeen // Garder la date pour référence
      }
    })
    return map
  }, [users, onlineUsers])

  return {
    users,
    lastMessagesMap,
    unreadCountsMap,
    onlineUsers,
    userStatusMap
  }
}