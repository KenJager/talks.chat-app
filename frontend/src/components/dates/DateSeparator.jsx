// components/DateSeparator.jsx
import React from 'react'

const DateSeparator = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
        {date}
      </div>
    </div>
  )
}

export default DateSeparator