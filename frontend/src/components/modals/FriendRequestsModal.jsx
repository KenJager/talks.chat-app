// FriendRequestsModal.jsx
import { useEffect, useState } from 'react'
import { UserCheck, Users, Check, X, Clock } from 'lucide-react'
import { useFriendStore } from '@stores/useFriendStore'
import defaultProfile from '@components/default.png'

const FriendRequestsModal = () => {
  const {
    friendRequests,
    sentRequests,
    getReceivedRequests,
    getSentRequests,
    acceptFriendRequest,
    declineFriendRequest,
    subscribeFriendRequestEvents
  } = useFriendStore()
  
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    getReceivedRequests()
    getSentRequests()
    
    // S'abonner aux événements socket en temps réel
    const cleanup = subscribeFriendRequestEvents()
    
    return cleanup
  }, [getReceivedRequests, getSentRequests, subscribeFriendRequestEvents])

  const handleAccept = async (requestId) => {
    setProcessingId(requestId)
    await acceptFriendRequest(requestId)
    setProcessingId(null)
  }

  const handleDecline = async (requestId) => {
    setProcessingId(requestId)
    await declineFriendRequest(requestId)
    setProcessingId(null)
  }

  const totalRequests = friendRequests.length + sentRequests.length

  return (
    <>
      <dialog id="friend_requests_modal" className="modal">
        <div className="modal-box max-w-md p-0 bg-base-100 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-base-content">Requests</h3>
                {totalRequests > 0 && (
                  <p className="text-xs text-base-content/50">{totalRequests} pending</p>
                )}
              </div>
            </div>
            <form method="dialog">
              <button className="p-1.5 rounded-full hover:bg-base-200 transition-colors">
                <X className="w-5 h-5 text-base-content/70" />
              </button>
            </form>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {/* Received Requests */}
            {friendRequests.length > 0 && (
              <div className="pb-2">
                <div className="sticky top-0 bg-base-100 px-4 py-2 border-b border-base-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Received ({friendRequests.length})
                    </span>
                  </div>
                </div>
                
                {friendRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between px-4 py-3 hover:bg-base-200 transition-colors border-b border-base-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={request.senderId.profilePicture || defaultProfile}
                        alt={request.senderId.fullName}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base-content truncate">{request.senderId.fullName}</p>
                        <p className="text-xs text-base-content/50 truncate">{request.senderId.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request._id)}
                        disabled={processingId === request._id}
                        className="p-2 rounded-full bg-green-500/10 hover:bg-green-500/20 
                          transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        {processingId === request._id ? (
                          <div className="loading loading-spinner loading-xs w-4 h-4"></div>
                        ) : (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDecline(request._id)}
                        disabled={processingId === request._id}
                        className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 
                          transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <div className="pb-2">
                <div className="sticky top-0 bg-base-100 px-4 py-2 border-b border-base-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      Sent ({sentRequests.length})
                    </span>
                  </div>
                </div>
                
                {sentRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between px-4 py-3 hover:bg-base-200 transition-colors border-b border-base-200 opacity-70">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={request.receiverId.profilePicture || defaultProfile}
                        alt={request.receiverId.fullName}
                        className="w-11 h-11 rounded-full object-cover opacity-70"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base-content/70 truncate">{request.receiverId.fullName}</p>
                        <p className="text-xs text-base-content/40 truncate">{request.receiverId.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10">
                      <Clock className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {friendRequests.length === 0 && sentRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-base-content/50">
                <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
                  <Users className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="font-medium">No requests</p>
                  <p className="text-sm">When someone sends you a request, it will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}

export default FriendRequestsModal