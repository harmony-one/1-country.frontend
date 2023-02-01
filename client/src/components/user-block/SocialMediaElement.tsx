import React from 'react';
import {SocialMedia} from "./UserBlock.data";

interface Props {
  data: SocialMedia
  onClick?: (item: SocialMedia) => void
}

export const SocialMediaElement: React.FC<Props> = ({ data, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      return onClick(data)
    }
    window.open(data.url, '_blank')
  }

  return (
    <div onClick={handleClick}>
      {data.icon}
    </div>
  )
}

SocialMediaElement
