import React from 'react'
import { Search } from 'lucide-react'

const SearchBar = ({ placeholder, value, onChange }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input input-bordered w-full pr-10 input-sm bg-base-200"
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
    </div>
  )
}

export default SearchBar