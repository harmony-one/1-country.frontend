import React from 'react'
import { AiFillHeart } from 'react-icons/ai'

export const WidgetLikes = ({ children }) => {
  return (
    <div>
      <AiFillHeart />
      <div>
        {Math.floor(Math.random() * 501)}
      </div>
    </div>
  )
}
