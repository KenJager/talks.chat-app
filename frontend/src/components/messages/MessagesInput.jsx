import React, { useState, useRef, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { X, Image, Send, SmileIcon, SendHorizontal } from 'lucide-react'
import { useChatStore } from '@stores/useChatStore'

const MessagesInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const { sendMessage } = useChatStore()
  const [openEmoji, setOpenEmoji] = useState(false)

  const handleEmoji = (e) => {
    setText(prev => prev + e.emoji)
    setOpenEmoji(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() && !imagePreview) return

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview
      })

      // Clear form
      setText("")
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Failed to send message : ", error)
    }
  }

  return (
    <div className='p-1 md:p-4 w-full'>
      {imagePreview && (
        <div className='mb-3 flex items-center gap-2'>
          <div className='relative'>
            <img
              src={imagePreview}
              alt="Preview"
              className='w-15 h-15 md:w-20 md:h-20 object-cover rounded-lg border border-zinc-700'
            />

            <button
              onClick={removeImage}
              className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center'
              type='button'
            >
              <X className='size-3' />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
        <div className='relative flex-1 flex items-center gap-2'>
          <div
            className={`text-zinc-400`}
          >
            <SmileIcon
              className='size-7 sm:size-8 bg-base-300/50 p-1 rounded-xs text-yellow-400'
              onClick={() => setOpenEmoji(prev => !prev)}
            />
          </div>
          <div className='absolute -top-90 z-100'>
            <EmojiPicker
              open={openEmoji}
              width={250}
              height={350}
              onEmojiClick={handleEmoji}
            />
          </div>
          <input
            type="text"
            className='w-full input input-bordered rounded-lg input-sm sm:input-md'
            placeholder='Type a message...'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            type='button'
            className={`${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className='size-7 sm:size-8 bg-base-300/50 p-1 rounded-xs' />
            <input
              type="file"
              accept='image/*'
              className='hidden'
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </button>
        </div>
        <button
          type='submit'
          className='bg-base-300/50 rounded-full p-1.5 cursor-pointer'
          disabled={!text.trim() && !imagePreview}
        >
          <SendHorizontal className={`size-6 sm:size-7 rounded-xs ${(text.trim() || imagePreview) ? 'text-primary':'text-zinc-400'}`} />
        </button>
      </form>
    </div>
  )
}

export default MessagesInput
