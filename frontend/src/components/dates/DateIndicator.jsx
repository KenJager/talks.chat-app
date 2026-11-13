// components/DateIndicator.jsx
import React from 'react'

const DateIndicator = ({ date }) => {
  if (!date) return null

  return (
    <div className="sticky top-0 z-10 flex justify-center pt-2 bg-transparent">
      <div className="bg-primary/80 text-white px-3 py-1 rounded-full text-xs shadow-lg">
        {date}
      </div>
    </div>
  )
}

export default DateIndicator