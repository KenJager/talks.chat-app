// MessagesInput.jsx
import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'
import { X, Image, SmileIcon, SendHorizontal, Loader2, Mic } from 'lucide-react'
import { useTypingStatus } from '@hooks/useTypingStatus'
import { useChatStore } from '@stores/useChatStore'
import { compressImage, imageToBase64 } from '@utils/imageCompression'

const MessagesInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [originalImageFile, setOriginalImageFile] = useState(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [openEmoji, setOpenEmoji] = useState(false)
  
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const { sendMessage, selectedUser } = useChatStore()
  const { startTyping, stopTyping } = useTypingStatus(selectedUser)
  const typingTimeoutRef = useRef(null)

  const handleTextChange = (e) => {
    const newText = e.target.value
    setText(newText)

    if (newText.trim().length > 0) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      startTyping()
      typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000)
    } else {
      stopTyping()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      stopTyping()
    }
  }, [stopTyping])

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 10MB")
      return
    }

    setIsCompressing(true)
    toast.loading("Compressing image...", { id: "compression" })

    try {
      const compressedFile = await compressImage(file)
      const base64 = await imageToBase64(compressedFile)

      setImagePreview(base64)
      setOriginalImageFile(compressedFile)

      toast.success(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`, {
        id: "compression",
        duration: 1500
      })

      startTyping()
      setTimeout(() => stopTyping(), 500)
    } catch (error) {
      console.error("Error compressing image:", error)
      toast.error("Failed to compress image", { id: "compression" })

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setOriginalImageFile(file)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsCompressing(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setOriginalImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    inputRef.current?.focus()
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!text.trim() && !imagePreview) || isSending || isCompressing) return

    stopTyping()
    setIsSending(true)

    const messageText = text.trim()
    let imageBase64 = imagePreview

    if (originalImageFile && !imagePreview) {
      imageBase64 = await imageToBase64(originalImageFile)
    }

    setText("")
    setImagePreview(null)
    setOriginalImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    try {
      await sendMessage({
        text: messageText,
        image: imageBase64
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
      setText(messageText)
      if (imageBase64) setImagePreview(imageBase64)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleEmoji = (e) => {
    setText(prev => prev + e.emoji)
    setOpenEmoji(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <div className="border-t border-base-200 dark:border-base-700 bg-base-100">
      {/* Image Preview - Style WhatsApp */}
      {imagePreview && (
        <div className="px-4 pt-3 pb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl shadow-md"
            />
            {isCompressing && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500
                flex items-center justify-center transition-colors shadow-md"
              type="button"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
            {originalImageFile && !isCompressing && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 
                bg-green-500/90 rounded-full text-[10px] text-white font-medium whitespace-nowrap">
                {Math.round(originalImageFile.size / 1024)}KB
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Area - Style WhatsApp */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3">
        {/* Left Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 
              dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors disabled:opacity-50"
          >
            <Image className={`w-6 h-6 ${imagePreview ? 'text-green-500' : ''}`} />
          </button>
        </div>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isCompressing ? "Compressing..." : "Type a message"}
            disabled={isCompressing}
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 
              rounded-full text-sm md:text-base
              focus:outline-none focus:ring-0 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-1">
          {/* <button
            type="button"
            onClick={() => setOpenEmoji(prev => !prev)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 
              dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <SmileIcon className="w-6 h-6" />
          </button> */}

          {!text.trim() && !imagePreview ? (
            <button
              type="button"
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 
                dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSending || isCompressing}
              className="p-2 rounded-full text-green-500 hover:text-green-600 
                hover:bg-green-50 dark:hover:bg-green-950/30 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <SendHorizontal className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={isCompressing}
        />
      </form>

      {/* Emoji Picker */}
      {openEmoji && (
        <div className="absolute bottom-20 left-4 z-50 shadow-xl rounded-2xl overflow-hidden">
          <EmojiPicker
            width={320}
            height={400}
            onEmojiClick={handleEmoji}
            autoFocusSearch={false}
            searchPlaceholder="Search emoji..."
          />
        </div>
      )}
    </div>
  )
}

export default MessagesInput