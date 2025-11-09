import { useEffect, useState } from 'react'
import { isSameDay, formatGroupDate } from '@lib/utils'

export const useGroupedMessages = (messages) => {
  const [groupedMessages, setGroupedMessages] = useState([])

  useEffect(() => {
    if (!messages.length) {
      setGroupedMessages([])
      return
    }

    const groups = []
    let currentGroup = {
      date: messages[0].createdAt,
      dateFormatted: formatGroupDate(messages[0].createdAt),
      messages: [],
    }

    messages.forEach((message, index) => {
      if (index === 0 || isSameDay(message.createdAt, currentGroup.date)) {
        currentGroup.messages.push(message)
      } else {
        groups.push(currentGroup)
        currentGroup = {
          date: message.createdAt,
          dateFormatted: formatGroupDate(message.createdAt),
          messages: [message],
        }
      }
    })

    groups.push(currentGroup)
    setGroupedMessages(groups)
  }, [messages])

  return groupedMessages
}