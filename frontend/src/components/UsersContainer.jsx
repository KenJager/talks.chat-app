// UsersContainer.jsx
import { Users, UserPlus2, Users as UsersIcon } from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'
import { useUsersMessages } from '@hooks/useUsersMessages'
import { useUserSearch } from '@hooks/useUserSearch'
import SidebarSkeleton from '@components/skeletons/SidebarSkeleton'
import UserItem from '@components/users/UserItem'
import SearchBar from '@components/users/SearchBar'
import AddContactModal from '@components/modals/AddContactModal'
import FriendRequestsModal from '@components/modals/FriendRequestsModal'
import { useFriendStore } from '@stores/useFriendStore'
import { useMemo, useState, useCallback } from 'react'
import { axiosInstance } from '@lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@stores/useAuthStore'

const UsersContainer = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { lastMessagesMap, unreadCountsMap, onlineUsers } = useUsersMessages()
  const { searchTerm, setSearchTerm, filteredUsers: searchFilteredUsers } = useUserSearch(users)
  const { authUser } = useAuthStore()
  
  // State for the modal
  const [allUsers, setAllUsers] = useState([])
  const [modalLoading, setModalLoading] = useState(false)

  const {
    friendRequests,
    sentRequests,
    isFriend
  } = useFriendStore()

  // Fonction fetchAllUsers dans le parent
  const fetchAllUsers = useCallback(async () => {
    if (!authUser) return
    try {
      setModalLoading(true)
      const res = await axiosInstance.get('/auth/all-users')
      const filtered = res.data.filter(user => 
        user._id !== authUser._id && !isFriend(user._id)
      )
      setAllUsers(filtered)
      return filtered
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error loading users')
      return []
    } finally {
      setModalLoading(false)
    }
  }, [authUser, isFriend])

  // Trier les utilisateurs par date du dernier message (les plus récents en premier)
  const sortedUsers = useMemo(() => {
    return [...searchFilteredUsers].sort((a, b) => {
      const lastMessageA = lastMessagesMap[a._id]
      const lastMessageB = lastMessagesMap[b._id]

      const dateA = lastMessageA?.createdAt ? new Date(lastMessageA.createdAt) : new Date(0)
      const dateB = lastMessageB?.createdAt ? new Date(lastMessageB.createdAt) : new Date(0)

      // Trier par date décroissante (plus récent en premier)
      return dateB - dateA
    })
  }, [searchFilteredUsers, lastMessagesMap])

  const openModal = () => {
    document.getElementById('add_contact_modal').showModal()
    fetchAllUsers() // Charge les utilisateurs quand on ouvre la modale
  }

  const totalRequests = friendRequests.length + sentRequests.length

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <aside
      className='h-full w-full md:w-96 border-r border-base-300 
      flex flex-col transition-all duration-200 relative bg-base-100'
    >
      {/* Header avec recherche */}
      <div className='border-b border-base-300 w-full p-4'>
        <div className='flex items-center gap-2'>
          <Users className='size-5' />
          <span className='font-medium'>Chats</span>
        </div>
        <div className="mt-3">
          <SearchBar
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des utilisateurs triée par dernier message */}
      <div className='overflow-y-auto w-full py-2 flex-1'>
        {sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
              <Users className="w-10 h-10 text-base-content/30" />
            </div>
            <div className="text-center">
              <p className="font-medium text-base-content">
                {searchTerm ? 'No contacts found' : 'No conversations yet'}
              </p>
              <p className="text-sm text-base-content/50 mt-1">
                {searchTerm
                  ? `No results for "${searchTerm}"`
                  : 'Start a new conversation by adding a contact'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-base-200">
            {sortedUsers.map((user) => (
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
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-5 right-5 z-30 flex flex-col gap-3">
        {/* Bouton des demandes d'amis */}
        <div className="relative">
          <button
            onClick={() => document.getElementById('friend_requests_modal').showModal()}
            className="w-12 h-12 rounded-full bg-secondary text-white 
              shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105
              flex items-center justify-center"
            aria-label="Friend requests"
          >
            <UsersIcon className="w-5 h-5" />
          </button>
          {totalRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold 
              rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-md
              animate-pulse">
              {totalRequests > 9 ? '9+' : totalRequests}
            </span>
          )}
        </div>

        {/* Bouton d'ajout de contact */}
        <button
          onClick={openModal}
          className="w-12 h-12 rounded-full bg-primary text-white 
            shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105
            flex items-center justify-center"
          aria-label="Add contact"
        >
          <UserPlus2 className="w-5 h-5" />
        </button>
      </div>

      {/* Modals */}
      <AddContactModal 
        allUsers={allUsers}
        modalLoading={modalLoading}
        onRefreshUsers={fetchAllUsers}
      />
      <FriendRequestsModal />
    </aside>
  )
}

export default UsersContainer