/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import { truncateAddressString } from '../../utils/utils'
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

const UserBlock = (props) => {
  const { pageName, wallet } = props
  const src = 'https://ipfs.io/ipfs/QmP7ZybNFUgQWKoim9fnFPLBCyoWnZ5GT5acc8MFX9YVuC'
  const alt = 'Image text'
  return (
    <UserBlockDiv>
      <div className='user-picture'>
        <img
          src={src}
          alt={alt}
        />
      </div>
      <div className='name-section'>
        <span>{`${pageName}.1`}</span>
        {wallet && <span>{`${truncateAddressString(wallet, 5)}`}</span>}
      </div>
      <div className='user-profile-text'>
        Insert your bio here
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
