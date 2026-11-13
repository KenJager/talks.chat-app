// hooks/useFriendRequestListener.js
import { useEffect } from 'react'
import { useFriendStore } from '@stores/useFriendStore'

export const useFriendRequestListener = () => {
  const { subscribeFriendRequestEvents } = useFriendStore()

  useEffect(() => {
    // S'abonner aux événements socket en temps réel
    const cleanup = subscribeFriendRequestEvents()
    
    return cleanup
  }, [subscribeFriendRequestEvents])
}
