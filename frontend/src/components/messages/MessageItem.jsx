// components/MessageItem.jsx
import React from 'react'
import { Check, CheckCheck } from 'lucide-react'
import defaultProfile from '@components/default.png'
import { formatMessageTime } from '@lib/utils'

const MessageItem = ({ message, authUser, selectedUser, isOwnMessage }) => {
  return (
    <div
      className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}
    >
      {!isOwnMessage && (
        <div className="chat-image avatar">
          <div className="size-7 md:size-9 rounded-full">
            <img
              src={selectedUser.profilePicture || defaultProfile}
              alt="profile pic"
            />
          </div>
        </div>
      )}

      <div className="chat-bubble flex flex-col">
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p className='text-sm lg:text-md'>{message.text}</p>}
      </div>
      
      <div className="chat-footer mt-1 -mr-2">
        <time className="text-xs opacity-50 mr-1">
          {formatMessageTime(message.createdAt)}
        </time>
        {isOwnMessage && (
          <div className="read-status">
            {message.read ? (
              <CheckCheck className="size-4 text-blue-600" />
            ) : (
              <Check className="size-4 text-gray-300" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageItem