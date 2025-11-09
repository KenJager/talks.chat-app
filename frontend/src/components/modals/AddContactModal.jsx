import React from 'react'
import { UserPlus2 } from 'lucide-react'
import SearchBar from '@components/users/SearchBar'

const AddContactModal = ({ searchTerm, onSearchChange }) => {
  return (
    <div>
      <div
        className='absolute bottom-5 right-5 bg-primary/10 text-white
        flex items-center justify-center p-1 w-12 h-12 rounded-lg cursor-pointer'
        onClick={() => document.getElementById('my_modal_3').showModal()}
      >
        <UserPlus2 className='text-primary' />
      </div>
      
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box -mt-80">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <div className='border-b border-base-300 w-full p-5'>
            <div className='flex items-center gap-2'>
              <UserPlus2 className='size-6' />
              <span className='font-medium'>Add Contacts</span>
            </div>
            <div className="mt-4">
              <SearchBar
                placeholder="Search users..."
              />
            </div>
          </div>
          {/* Ajouter ici la liste des utilisateurs à ajouter */}
        </div>
      </dialog>
    </div>
  )
}

export default AddContactModal