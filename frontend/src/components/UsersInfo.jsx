// UsersInfo.jsx
import React, { useState, useMemo } from 'react'
import { 
  ArrowLeft, Phone, Video, Ban, 
  Image as ImageIcon, Link, Download, 
  X, Clock, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'
import defaultProfile from '@components/default.png'
import { useUsersMessages } from '@hooks/useUsersMessages'
import { useChat } from '@hooks/useChat'

const UsersInfo = () => {
  const { selectedUser, isOpen, setIsOpen } = useChatStore()
  const { userStatusMap } = useUsersMessages()
  const { messageImages, messages } = useChat(selectedUser)
  const [activeTab, setActiveTab] = useState('media')
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  const lastMessageDate = messages[messages.length - 1]?.createdAt

  // Créer un tableau combiné de toutes les images (profil + messages)
  const allImages = useMemo(() => {
    const images = []
    // Ajouter l'image de profil en premier
    if (selectedUser?.profilePicture) {
      images.push({
        src: selectedUser.profilePicture,
        type: 'profile',
        name: `${selectedUser.fullName}'s profile`
      })
    }
    // Ajouter les images des messages
    messageImages.forEach(img => {
      images.push({
        src: img,
        type: 'message',
        name: 'Shared image'
      })
    })
    return images
  }, [selectedUser, messageImages])

  const currentImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null

  const handlePrevImage = (e) => {
    e.stopPropagation()
    setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)
  }

  const openImageModal = (index) => {
    setSelectedImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImageIndex(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No messages yet'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <>
      {/* Modal pour l'image avec navigation */}
      {currentImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-110 flex items-center justify-center"
          onClick={closeImageModal}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
            onClick={closeImageModal}
          >
            <X className="w-6 h-6 text-base-content" />
          </button>

          {/* Image */}
          <img 
            src={currentImage.src} 
            alt={currentImage.name} 
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Download button */}
          <a 
            href={currentImage.src} 
            download={`${currentImage.type}-image.jpg`}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-6 h-6 text-base-content" />
          </a>

          {/* Navigation buttons - afficher seulement s'il y a plusieurs images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-base-content" />
              </button>

              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-base-content" />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-4 left-4 bg-base-300 px-3 py-1.5 rounded-full text-sm text-base-content">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
              
              {/* Image type indicator */}
              <div className="absolute top-4 left-4 bg-base-300 px-3 py-1.5 rounded-full text-sm text-base-content capitalize">
                {currentImage.type === 'profile' ? '👤 Profile' : '📸 Shared'}
              </div>
            </>
          )}
        </div>
      )}

      <aside
        className={`h-full w-full md:w-96 border-l border-base-300
        absolute z-100 bg-base-100 flex flex-col transition-all duration-300 ease-in-out
        ${!isOpen && '-right-full'} md:relative md:right-0 shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-base-300">
          <button
            onClick={() => setIsOpen(isOpen)}
            className="p-2 rounded-full hover:bg-base-300 transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-base-content" />
          </button>
          <h2 className="text-lg font-semibold text-base-content">Contact Info</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center py-8 px-4 border-b border-base-300">
            <div className="relative mb-4">
              <button
                onClick={() => selectedUser?.profilePicture && openImageModal(0)}
                className={selectedUser?.profilePicture ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                title={selectedUser?.profilePicture ? "Click to view profile picture" : ""}
              >
                <img
                  src={selectedUser.profilePicture || defaultProfile}
                  alt={selectedUser.fullName}
                  className="w-28 h-28 rounded-full object-cover shadow-lg"
                />
              </button>
              <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-base-100
                ${userStatusMap[selectedUser._id]?.isOnline ? 'bg-success' : 'bg-base-400'}`}>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-base-content">
              {selectedUser.fullName}
            </h3>
            
            <p className="text-sm text-base-content/70 mt-1">
              {userStatusMap[selectedUser._id]?.isOnline ? 'Online' : userStatusMap[selectedUser._id]?.lastSeenText}
            </p>
            
            {selectedUser.about && (
              <p className="text-sm text-center text-base-content/80 mt-3 px-4 italic">
                "{selectedUser.about}"
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-base-300">
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-base-200 transition-colors group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-base-content/70">Voice</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-base-200 transition-colors group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-base-content/70">Video</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-base-200 transition-colors group">
              <div className="p-2 rounded-full bg-error/10 group-hover:bg-error/20 transition-colors">
                <Ban className="w-5 h-5 text-error" />
              </div>
              <span className="text-xs text-base-content/70">Block</span>
            </button>
          </div>

          {/* Info Sections */}
          <div className="p-4 space-y-4">
            {/* Tabs */}
            <div className="border-b border-base-300">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('media')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative
                    ${activeTab === 'media' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-base-content/60 hover:text-base-content/80'}`}
                >
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>Media</span>
                    <span className="text-xs ml-1">({messageImages.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative
                    ${activeTab === 'docs' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-base-content/60 hover:text-base-content/80'}`}
                >
                  <div className="flex items-center gap-1">
                    <Link className="w-4 h-4" />
                    <span>Links</span>
                    <span className="text-xs ml-1">(0)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Media Grid */}
            {activeTab === 'media' && (
              <div>
                {messageImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {messageImages.slice(0, 9).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // L'index dans allImages = index dans messageImages + 1 (car profil est à 0)
                          const profileOffset = selectedUser?.profilePicture ? 1 : 0
                          openImageModal(index + profileOffset)
                        }}
                        className="relative group aspect-square overflow-hidden rounded-lg bg-base-200"
                      >
                        <img
                          src={image}
                          alt={`Shared ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-base-content/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-base-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-base-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-base-content/40" />
                    </div>
                    <p className="text-sm text-base-content/60">No media shared yet</p>
                    <p className="text-xs text-base-content/40 mt-1">
                      Photos and videos you share will appear here
                    </p>
                  </div>
                )}
                
                {messageImages.length > 9 && (
                  <button className="mt-4 text-sm text-primary font-medium text-center w-full hover:underline">
                    View all ({messageImages.length})
                  </button>
                )}
              </div>
            )}

            {/* Links Tab */}
            {activeTab === 'docs' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-base-200 flex items-center justify-center">
                  <Link className="w-8 h-8 text-base-content/40" />
                </div>
                <p className="text-sm text-base-content/60">No links shared yet</p>
                <p className="text-xs text-base-content/40 mt-1">
                  Links shared in this chat will appear here
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-6 pt-4 border-t border-base-300 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-base-content/50" />
                <div>
                  <p className="text-base-content/60">Member since</p>
                  <p className="text-base-content font-medium">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>
              
              {lastMessageDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-base-content/50" />
                  <div>
                    <p className="text-base-content/60">Last active</p>
                    <p className="text-base-content font-medium">
                      {formatDate(lastMessageDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default UsersInfo