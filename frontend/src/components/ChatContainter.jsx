import React from 'react'
import { useChatStore } from '@stores/useChatStore'
import MessagesInput from '@components/messages/MessagesInput'
import ChatHeader from '@components/ChatHeader'
import MessageSkeleton from './skeletons/MessageSkeleton'
import MessageItem from '@components/messages/MessageItem'
import DateSeparator from '@components/dates/DateSeparator'
import DateIndicator from '@components/dates/DateIndicator'
import { useChat } from '@hooks/useChat'
import { useGroupedMessages } from '@hooks/useGroupedMessages'
import { useDateIndicator } from '@hooks/useDateIndicator'

const ChatContainer = () => {
  const { selectedUser, isMessagesLoading } = useChatStore()
  const {
    messages,
    authUser,
    messageEndRef,
    messagesContainerRef,
  } = useChat(selectedUser)

  const groupedMessages = useGroupedMessages(messages)
  const currentDateIndicator = useDateIndicator(groupedMessages, messagesContainerRef)

  return (
    <div className="absolute w-full sm:relative flex-1 flex flex-col bg-base-100 h-full">
      <ChatHeader />

      {isMessagesLoading ? (
        <MessageSkeleton />
      ) : (
        <div className="relative flex-1 overflow-auto">
          <DateIndicator date={currentDateIndicator} />

          <div
            ref={messagesContainerRef}
            className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-4"
          >
            <div className="space-y-6">
              {groupedMessages.map((group, groupIndex) => (
                <div
                  key={group.date}
                  id={`group-${groupIndex}`}
                  className="space-y-2"
                >
                  <DateSeparator date={group.dateFormatted} />

                  {group.messages.map((message) => (
                    <MessageItem
                      key={message._id}
                      message={message}
                      authUser={authUser}
                      selectedUser={selectedUser}
                      isOwnMessage={message.senderId === authUser._id}
                    />
                  ))}
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>
        </div>
      )}
      <MessagesInput />
    </div>
  )
}

export default ChatContainer