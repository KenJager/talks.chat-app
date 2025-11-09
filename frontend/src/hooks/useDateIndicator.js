// hooks/useDateIndicator.js
import { useEffect, useState } from 'react'

export const useDateIndicator = (groupedMessages, messagesContainerRef) => {
  const [currentDateIndicator, setCurrentDateIndicator] = useState('')

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !groupedMessages.length) return

    const handleScroll = () => {
      let visibleDate = ''

      for (let i = groupedMessages.length - 1; i >= 0; i--) {
        const group = groupedMessages[i]
        const groupElement = document.getElementById(`group-${i}`)

        if (groupElement) {
          const rect = groupElement.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()

          if (rect.top <= containerRect.top + 50) {
            visibleDate = group.dateFormatted
            break
          }
        }
      }

      setCurrentDateIndicator(visibleDate)
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [groupedMessages, messagesContainerRef])

  return currentDateIndicator
}