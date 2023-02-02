import React from 'react';

interface Props {
  url?: string;
  icon: React.ReactNode
  onClick?: () => void
}

export const SocialMediaElement: React.FC<Props> = ({ icon, url, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      return onClick()
    }
    window.open(url, '_blank')
  }

  return (
    <div onClick={handleClick}>
      {icon}
    </div>
  )
}

SocialMediaElement
