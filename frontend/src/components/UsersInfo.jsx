import React from 'react'
import { ArrowLeftCircle, LucideVideo, PhoneIcon, UserLockIcon } from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'
import defaultProfile from '@components/default.png'
import { useUsersMessages } from '@hooks/useUsersMessages'
import { useChat } from '@hooks/useChat'

const UsersInfo = () => {
  const { selectedUser, isOpen, setIsOpen } = useChatStore()
  const { userStatusMap } = useUsersMessages()
  const { messageImages } = useChat(selectedUser)


  return (
    <aside
      className={`h-full md:w-70 border-l border-base-300 
      absolute z-10 w-full ${!isOpen && '-right-200'} md:relative md:right-0
      bg-base-100 flex flex-col transition-all duration-200 py-1`}
    >
      <div className='md:hidden flex items-center justify-start p-2'>
        <div
          className='p-1.5 hover:bg-white/10 rounded-2xl transition-colors'
          onClick={() => setIsOpen(isOpen)}
        >
          <ArrowLeftCircle />
        </div>
      </div>
      <div className='overflow-auto'>
        <div className='flex items-center justify-center p-2 sm:pt-9'>
          <div className='avatar'>
            <div className='size-25 rounded-full'>
              <img src={selectedUser.profilePicture || defaultProfile} alt={selectedUser.fullName} />
            </div>
          </div>
        </div>
        <div className='text-center'>
          <span className='font-bold text-xl'>{selectedUser.fullName}</span>
          <p className='text-xs text-base-content/70'>
            {userStatusMap[selectedUser._id]?.lastSeenText}
          </p>
        </div>
        <div className='text-center p-2 mt-2'>
          <p className='text-sm'>{selectedUser.proverbePhrase}</p>
        </div>
        <div className='flex items-center justify-center gap-4 p-2'>
          <div className='flex flex-col items-center justify-center bg-base-200 px-4 py-2 rounded-xl text-xs cursor-pointer'>
            <PhoneIcon size={18} />
            <span>Call</span>
          </div>
          <div className='flex flex-col items-center justify-center bg-base-200 px-4 py-2 rounded-xl text-xs cursor-pointer'>
            <LucideVideo size={18} />
            <span>Video</span>
          </div>
          <div className='flex flex-col items-center justify-center bg-base-200 px-4 py-2 rounded-xl text-xs cursor-pointer text-red-400'>
            <UserLockIcon size={18} />
            <span>Block</span>
          </div>
        </div>

        {/* Shared Photos */}
        <div className='flex flex-col'>
          <div className='w-full flex items-center justify-center border-b border-base-300'>
            <div className='flex gap-5'>
              <button className='p-2 text-sm cursor-pointer ml-4 border-b-2 border-primary text-primary'>
                photos shared
              </button>
              <button className='p-2 text-sm cursor-pointer mr-4'>
                links shared
              </button>
            </div>
          </div>
          {messageImages.length > 0 ? (
            <div className='grid grid-cols-4 md:grid-cols-3 sm:grid-cols-6 p-1 gap-0.5'>
              {messageImages.map((image, index) => (
                <div key={index} className='w-full h-20 overflow-hidden'>
                  <img
                    src={image}
                    alt={`shared-${index}`}
                    className='w-full h-full object-cover hover:scale-110 transition-transform duration-200'
                  />
                </div>
              ))} 
            </div>
          ) : (
            <p className='text-center mt-10'>No image found</p>
          )}
        </div>
      </div>
    </aside>
  )
}

export default UsersInfo
