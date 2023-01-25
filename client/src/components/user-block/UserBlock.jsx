/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import { SOCIAL_MEDIA } from './UserBlock.data'
import { UserBlockDiv } from './UserBlock.styles'

const SocialMediaIcon = (props) => {
  const { children, url } = props
  const handleClick = () => {
    window.open(url, '_blank')
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

const UserBlock = () => {
  const src = 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  const alt = 'Image text'
  return (
    <UserBlockDiv>
      <div className='user-picture'>
        <img
          src={src}
          alt={alt}
        />
      </div>
      <div className='user-profile-text'>
        Sed ut perspiciatis unde omnis iste natus
      </div>
      <div className='social-networks'>
        {SOCIAL_MEDIA.map((icon, index) => (
          <SocialMediaIcon url={icon.url} key={index}>
            {icon.icon}
          </SocialMediaIcon>
        ))}
      </div>
    </UserBlockDiv>
  )
}

export default UserBlock
