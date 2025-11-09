import React from 'react'
import { ArrowLeftCircle, LucideVideo, PhoneIcon } from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'
import { useAuthStore } from '@stores/useAuthStore'
import defaultProfile from '@components/default.png'
import { useUsersMessages } from '@hooks/useUsersMessages'

const ChatHeader = () => {
    const { selectedUser, setSelectedUser,  isOpen, setIsOpen } = useChatStore()
    const { userStatusMap } = useUsersMessages()
  return ( 
    <div className='p-2.5 border-b border-base-300'>
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                {/* ArrowLeft */}
                <button 
                    className='hover:bg-white/10 p-1.5 rounded-2xl transition-colors'
                    onClick={()=> setSelectedUser(null)}
                >
                    <ArrowLeftCircle />
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
                    onClick={()=>setIsOpen(isOpen)}
                >
                    <h3 className='font-meduim'>{selectedUser.fullName}</h3>
                    <p className='text-xs text-base-content/70'>
                        {userStatusMap[selectedUser._id]?.lastSeenText}
                    </p>
                </div>
            </div>

            {/* Call button */}
            <div className='flex items-center gap-3 pr-3 md:pr-10'>
                <PhoneIcon className='hover:bg-white/10 p-2 rounded-xl transition-colors size-9 sm:size-10'/>
                <LucideVideo className='hover:bg-white/10 p-2 rounded-xl transition-colors size-9 sm:size-10'/>
            </div>
        </div>      
    </div>
  )
}

export default ChatHeader
