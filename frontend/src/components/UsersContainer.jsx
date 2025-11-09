import React from 'react'
import { Users } from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'
import { useUsersMessages } from '@hooks/useUsersMessages'
import { useUserSearch } from '@hooks/useUserSearch'
import SidebarSkeleton from '@components/skeletons/SidebarSkeleton'
import UserItem from '@components/users/UserItem'
import SearchBar from '@components/users/SearchBar'
import AddContactModal from '@components/modals/AddContactModal'

const UsersContainer = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { lastMessagesMap, unreadCountsMap, onlineUsers } = useUsersMessages()
  const { searchTerm, setSearchTerm, filteredUsers } = useUserSearch(users)

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <aside
      className='h-full w-full sm:w-20 lg:w-62 border-r border-base-300 
      flex flex-col transition-all duration-200 relative'
    >
      {/* Header avec recherche */}
      <div className='border-b border-base-300 w-full p-5'>
        <div className='flex items-center gap-2'>
          <Users className='size-6' />
          <span className='font-medium sm:hidden lg:block'>Contacts</span>
        </div>
        <div className="mt-4">
          <SearchBar
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className='overflow-y-auto w-full py-3 flex-1'>
        {filteredUsers.map((user) => (
          <UserItem
            key={user._id}
            user={user}
            isSelected={selectedUser?._id === user._id}
            lastMessage={lastMessagesMap[user._id]}
            unreadCount={unreadCountsMap[user._id]}
            isOnline={onlineUsers.includes(user._id)}
            onSelect={() => setSelectedUser(user)}
          />
        ))}
      </div>

      {/* Modal d'ajout de contact */}
      <AddContactModal 
        searchTerm={searchTerm}
        onSearchChange={''}
      />
    </aside>
  )
}

export default UsersContainer