import defaultProfile from '@components/default.png'
import { formatMessageTime } from '@lib/utils'
import { useTypingStatus } from '@hooks/useTypingStatus'
import { Check, CheckCheck, Mic, Image, FileText, XCircle } from 'lucide-react'

const UserItem = ({
  user,
  isSelected,
  lastMessage,
  unreadCount,
  isOnline,
  onSelect
}) => {
  const { isTyping } = useTypingStatus(user)

  // Statut du message (vu, envoyé, etc.)
  const getMessageStatus = () => {
    if (!lastMessage || lastMessage.senderId === user._id) return null
    
    if (lastMessage.read) {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
    }
    if (lastMessage.delivered) {
      return <CheckCheck className="w-3.5 h-3.5 text-base-content/40" />
    }
    return <Check className="w-3.5 h-3.5 text-base-content/40" />
  }

  // Type de message (texte, image, etc.)
  const getMessageType = () => {
    if (!lastMessage) return null
    
    if (lastMessage.text && lastMessage.text.startsWith('/sticker')) {
      return { icon: <FileText className="w-3.5 h-3.5" />, text: 'Sticker' }
    }
    if (lastMessage.image) {
      return { icon: <Image className="w-3.5 h-3.5" />, text: 'Photo' }
    }
    if (lastMessage.voiceNote) {
      return { icon: <Mic className="w-3.5 h-3.5" />, text: 'Voice message' }
    }
    if (lastMessage.text && lastMessage.text.length > 0) {
      return { icon: null, text: lastMessage.text }
    }
    return null
  }

  const getLastMessageText = () => {
    if (!lastMessage) return "No messages yet"

    // Message en cours d'envoi (optimistic)
    if (lastMessage.isTemp) {
      return "Sending..."
    }

    const messageType = getMessageType()
    if (!messageType) return "No messages yet"

    // Tronquer le texte si trop long
    if (messageType.text && messageType.text.length > 25) {
      return `${messageType.text.substring(0, 25)}...`
    }

    return messageType.text
  }

  const getLastMessageTimeout = () => {
    if (!lastMessage) return ""
    return formatMessageTime(lastMessage.createdAt)
  }

  // Déterminer si le message est de l'utilisateur connecté
  const isMyMessage = lastMessage && lastMessage.senderId !== user._id
  const messageType = getMessageType()

  return (
    <button
      onClick={onSelect}
      className={`
        w-full flex items-center gap-3 px-4 py-3 
        transition-all duration-200 relative
        hover:bg-base-200 active:bg-base-300
        ${isSelected ? 'bg-primary/10 hover:bg-primary/15' : 'bg-base-100'}
      `}
    >
      {/* Avatar Section - Style WhatsApp */}
      <div className="relative flex-shrink-0">
        <div className="relative">
          <img
            src={user.profilePicture || defaultProfile}
            alt={user.fullName}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.src = defaultProfile
            }}
          />
          {/* Indicateur en ligne */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 
              ring-2 ring-base-100 shadow-sm">
            </span>
          )}
        </div>
        {/* Animation pour les stories (optionnel) */}
        {user.hasStory && (
          <div className="absolute -inset-0.5 rounded-full border-2 border-primary/50 animate-pulse"></div>
        )}
      </div>

      {/* User Info - Style WhatsApp Desktop */}
      <div className="flex-1 min-w-0 text-left">
        {/* Header: Name + Time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3 className="font-medium text-base-content truncate text-sm md:text-base">
            {user.fullName}
          </h3>
          {!isTyping && (
            <span className="text-[11px] text-base-content/40 flex-shrink-0">
              {getLastMessageTimeout()}
            </span>
          )}
        </div>

        {/* Message Preview */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isTyping ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-primary font-medium animate-pulse">
                  Typing
                </span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            ) : (
              <>
                {/* Statut du message (pour mes messages) */}
                {isMyMessage && lastMessage && !lastMessage.isTemp && (
                  <span className="flex-shrink-0">
                    {getMessageStatus()}
                  </span>
                )}

                {/* Indicateur de message en cours d'envoi */}
                {lastMessage?.isTemp && (
                  <div className="flex-shrink-0">
                    <div className="loading loading-spinner loading-xs w-3 h-3 text-base-content/40"></div>
                  </div>
                )}

                {/* Icône du type de message */}
                {messageType?.icon && (
                  <span className="flex-shrink-0 text-base-content/40">
                    {messageType.icon}
                  </span>
                )}

                {/* Texte du message */}
                <p className={`text-sm truncate flex-1
                  ${!lastMessage ? 'text-base-content/40 italic' : 'text-base-content/70'}
                  ${unreadCount > 0 && !isSelected ? 'text-base-content font-medium' : ''}
                `}>
                  {getLastMessageText()}
                </p>
              </>
            )}
          </div>

          {/* Unread Badge - Style WhatsApp */}
          {unreadCount > 0 && !isSelected && (
            <div className="flex-shrink-0">
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white 
                text-[11px] font-semibold flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de sélection (optionnel) */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
      )}
    </button>
  )
}

export default UserItem