import React from 'react'
import defaultProfile from '@components/default.png'
import { formatMessageTime } from '@lib/utils'

const UserItem = ({ 
  user, 
  isSelected, 
  lastMessage, 
  unreadCount, 
  isOnline, 
  onSelect 
}) => {
  const getLastMessageText = () => {
    if (!lastMessage) return "No messages yet"
    
    if (lastMessage.text) {
      return lastMessage.text.length > 22 
        ? `${lastMessage.text.substring(0, 22)}...`
        : lastMessage.text
    }
    
    if (lastMessage.image) return "📷 Image"
    
    return "No messages yet"
  }

  const getLastMessageTimeout = () => {
    if (!lastMessage) return ""
    
    return formatMessageTime(lastMessage.createdAt)
  }

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-2 sm:p-3 flex items-center gap-3 
        hover:bg-base-300 transition-colors relative
        ${isSelected ? "bg-base-200 ring-1 ring-base-300" : ""}
      `}
    >
      <div className='relative sm:mx-auto lg:mx-0'>
        <img
          src={user.profilePicture || defaultProfile}
          alt={user.fullName}
          className='size-9 sm:size-12 object-cover rounded-full'
        />
        {isOnline && (
          <span
            className='absolute bottom-0 right-0 size-3 bg-green-500
            rounded-full ring-2 ring-base-300'
          ></span>
        )}
      </div>

      {/* User info - only visible on larger screens */}
      <div className='sm:hidden lg:block text-left min-w-0 flex-1'>
        <div className='flex justify-between sm:font-medium truncate'>
          <span className='text-md font-semibold'>{user.fullName}</span>
          <span className='text-xs'>{getLastMessageTimeout()}</span>
        </div>
        <div className='text-sm text-zinc-400 truncate'>
          {getLastMessageText()}
        </div>
      </div>

      {/* Badge de messages non lus */}
      {unreadCount > 0 && (
        <span className='absolute right-2 top-7 bg-green-600 text-white text-xs p-1 px-1.5 rounded-full'>
          {unreadCount}
        </span>
      )}
    </button>
  )
}

export default UserItem