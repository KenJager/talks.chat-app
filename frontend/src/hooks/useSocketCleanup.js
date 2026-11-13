import { useEffect } from 'react'
import { useAuthStore } from '@stores/useAuthStore'

export const useSocketCleanup = () => {
  const { socket, authUser } = useAuthStore()

  useEffect(() => {
    // Nettoyer le socket si l'utilisateur n'est plus authentifié
    if (!authUser && socket) {
      socket.disconnect()
    }
  }, [authUser, socket])
}