// AddContactModal.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { UserPlus2, UserCheck, Clock, Search, X } from 'lucide-react'
import { useFriendStore } from '@stores/useFriendStore'
import defaultProfile from '@components/default.png'

const AddContactModal = ({ allUsers = [], modalLoading = false, onRefreshUsers }) => {
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [imageErrors, setImageErrors] = useState({})
  const imageCache = useRef(new Set())

  const {
    sendFriendRequest,
    hasSentRequest,
    hasReceivedRequest,
  } = useFriendStore()

  // Réinitialiser les erreurs d'image quand la modale se ferme
  useEffect(() => {
    const modal = document.getElementById('add_contact_modal')
    if (!modal) return

    const handleClose = () => {
      setSearchInput('')
      setImageErrors({}) // Reset image errors on modal close
      imageCache.current.clear() // Clear image cache
    }

    modal.addEventListener('close', handleClose)

    return () => {
      modal.removeEventListener('close', handleClose)
    }
  }, [])

  // Filtrage des utilisateurs
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredUsers(allUsers)
    } else {
      const filtered = allUsers.filter(user =>
        user.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchInput.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchInput, allUsers])

  const closeModal = () => {
    setSearchInput('')
    document.getElementById('add_contact_modal').close()
  }

  const handleSendRequest = async (userId) => {
    await sendFriendRequest(userId)
    if (onRefreshUsers) {
      await onRefreshUsers()
    }
  }

  const getImageUrl = useCallback((userId, profilePicture) => {
    // Si l'image a déjà échoué, retourner default.png directement
    if (imageErrors[userId]) {
      return defaultProfile
    }
    
    // Si l'URL est déjà en cache et valide
    const imageUrl = profilePicture || defaultProfile
    
    // Éviter les requêtes pour default.png si ce n'est pas nécessaire
    if (!profilePicture) {
      return defaultProfile
    }
    
    return imageUrl
  }, [imageErrors])

  const handleImageError = useCallback((userId) => {
    // Éviter de définir plusieurs fois la même erreur
    if (!imageErrors[userId]) {
      setImageErrors(prev => ({
        ...prev,
        [userId]: true
      }))
    }
  }, [imageErrors])

  const getUserStatus = (user) => {
    if (hasSentRequest(user._id)) {
      return { status: 'pending', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', label: 'Request Sent' }
    }
    if (hasReceivedRequest(user._id)) {
      return { status: 'received', icon: UserCheck, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/20', label: 'Request Received' }
    }
    return { status: 'available', icon: UserPlus2, color: 'text-primary', bgColor: 'bg-primary/10', label: 'Add Contact' }
  }

  return (
    <>
      <dialog id="add_contact_modal" className="modal">
        <div className="modal-box max-w-md p-0 bg-base-100 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-base-content">New Contact</h3>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full hover:bg-base-200 transition-colors"
            >
              <X className="w-5 h-5 text-base-content/70" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-base-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-base-200 rounded-lg 
                  focus:outline-none focus:ring-1 focus:ring-primary
                  placeholder:text-base-content/40"
              />
            </div>
          </div>

          {/* User List */}
          <div className="h-96 overflow-y-auto">
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="loading loading-spinner loading-md text-primary"></div>
                <p className="text-sm text-base-content/60">Loading contacts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/50">
                <UserPlus2 className="w-12 h-12 opacity-30" />
                <p className="text-sm">No users found</p>
                <p className="text-xs">Try searching with a different name</p>
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                {filteredUsers.map((user) => {
                  const { status, icon: StatusIcon, color, bgColor, label } = getUserStatus(user)
                  return (
                    <div key={user._id} className="flex items-center justify-between px-4 py-3 hover:bg-base-200 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={getImageUrl(user._id, user.profilePicture)}
                          alt={user.fullName}
                          className="w-11 h-11 rounded-full object-cover"
                          loading="lazy"
                          onError={() => handleImageError(user._id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base-content truncate">{user.fullName}</p>
                          <p className="text-xs text-base-content/50 truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      {status === 'available' ? (
                        <button
                          onClick={() => handleSendRequest(user._id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${bgColor} ${color} hover:opacity-80 transition-opacity`}
                        >
                          Add
                        </button>
                      ) : (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${bgColor}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${color}`} />
                          <span className={`text-xs font-medium ${color}`}>{label}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}

export default AddContactModal