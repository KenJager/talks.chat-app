import { useEffect, useState } from 'react'
import { ArrowLeft, LucideVideo, PhoneIcon } from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'
import { useTypingStatus } from '@hooks/useTypingStatus'
import defaultProfile from '@components/default.png'
import { useUsersMessages } from '@hooks/useUsersMessages'

const ChatHeader = () => {
    const { selectedUser, setSelectedUser, isOpen, setIsOpen } = useChatStore()
    const { userStatusMap } = useUsersMessages()

    const { isTyping } = useTypingStatus(selectedUser)

    // Animation des points pour l'indicateur "writing..."
    const [dots, setDots] = useState('')

    useEffect(() => {
        if (!isTyping) return

        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.')
        }, 500)

        return () => clearInterval(interval)
    }, [isTyping])

    return (
        <div className='p-2.5 border-b border-base-300'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    {/* ArrowLeft */}
                    <button
                        className='hover:bg-white/10 p-1.5 rounded-2xl transition-colors'
                        onClick={() => setSelectedUser(null)}
                    >
                        <ArrowLeft className="w-5 h-5 text-base-content" />
                    </button>
                    {/* Avatar */}
                    <div className='avatar'>
                        <div className='size-8 sm:size-10 rounded-full relative'>
                            <img src={selectedUser.profilePicture || defaultProfile} alt={selectedUser.fullName} />
                        </div>
                    </div>

                    {/* User info */}
                    <div
                        className='cursor-pointer md:cursor-default'
                        onClick={() => setIsOpen(isOpen)}
                    >
                        <h3 className='font-meduim'>{selectedUser.fullName}</h3>
                        {isTyping ? (
                            <p className='text-primary text-xs animate-pulse'>
                                Writing{dots}
                            </p>
                        ) :
                            <p className='text-xs text-base-content/70'>
                                {userStatusMap[selectedUser._id]?.lastSeenText}
                            </p>
                        }
                    </div>
                </div>

                {/* Call button */}
                <div className='flex items-center gap-2 pr-3 md:pr-10'>
                    <div className='hover:bg-white/10 p-2 rounded-xl'>
                        <PhoneIcon className='transition-colors size-5 sm:size-6' />
                    </div>
                    <div className='hover:bg-white/10 p-2 rounded-xl'>
                        <LucideVideo className='transition-colors size-5 sm:size-6' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatHeader
