import React from 'react'
import { useChatStore } from '@stores/useChatStore'
import NoChatSelected from '@components/NoChatSelected'
import ChatContainter from '@components/ChatContainter'
import UsersContainer from '@components/UsersContainer'
import UsersInfo from '@components/UsersInfo'

const HomePage = () => {
  const { selectedUser } = useChatStore()

  return (
    <div className='h-screen bg-base-200'>
      <div className='h-full flex items-center justify-center pt-13 md:pt-17 md:px-2'>
        <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-full sm:h-[calc(100vh-5rem)]'>
          <div className='relative flex h-full rounded-lg overflow-hidden'>
            <UsersContainer />

            {!selectedUser ? <NoChatSelected /> : <ChatContainter />}

            {/* <UsersInfo />  */}

            {selectedUser &&<UsersInfo />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
