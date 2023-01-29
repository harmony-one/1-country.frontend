/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useWeb3Modal } from '@web3modal/react'
import { useSelector } from 'react-redux'
import { selectPageName } from '../../utils/store/pageSlice'
import { truncateAddressString } from '../../utils/utils'
import { SOCIAL_MEDIA } from './UserBlock.data'
import { UserBlockDiv, WalletStatus } from './UserBlock.styles'
import { toast } from 'react-toastify'

const SocialMediaIcon = (props) => {
  const { children, url, onClick } = props
  const handleClick = () => {
    if (onClick) {
      return onClick()
    }
    window.open(url, '_blank')
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

const defaultOwnerInfo = {
  telegram: '',
  email: '',
  phone: ''
}

const UserBlock = (props) => {
  const { isOwner, client, walletAddress, isClientConnected } = props
  const pageName = useSelector(selectPageName)
  const src = 'https://ipfs.io/ipfs/QmP7ZybNFUgQWKoim9fnFPLBCyoWnZ5GT5acc8MFX9YVuC'
  const alt = 'Image text'
  const [ownerInfo, setOwnerInfo] = useState(defaultOwnerInfo)

  useEffect(() => {
    const getInfo = async () => {
      const info = await client.getAllOwnerInfo({ name: pageName })
      setOwnerInfo(info)
    }
    if (isOwner) {
      console.log('is owner')
      getInfo()
    }
  }, [])

  useEffect(() => {
    if (!isOwner) {
      setOwnerInfo(defaultOwnerInfo)
    }
  }, [isOwner])

  const toastId = useRef(null)

  const { open } = useWeb3Modal()

  const reveal = async (infoName) => {
    if (isClientConnected) {
      toastId.current = toast.loading('Processing transaction')

      const info = await client.revealInfo({ name: pageName, info: infoName })
      if (info) {
        setOwnerInfo({ ...ownerInfo, [infoName]: info })

        toast.update(toastId.current, {
          render: 'Transaction success!',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        })

        return info
      } else {
        toast.update(toastId.current, {
          render: 'Error processing the transaction',
          type: 'error',
          isLoading: false,
          autoClose: 2000
        })
      }
    } else {
      toast.error('Please connect your wallet')
    }
  }

  const redirectToTelegram = (name) => {
    window.open(`https://t.me/${name}`, '_black')
  }

  const handleSocialClick = useCallback(async (icon) => {
    if (!isClientConnected) {
      await open({ route: 'ConnectWallet' })
    }

    const infoName = icon.name

    let infoValue = ownerInfo[infoName]

    if (!infoValue) {
      infoValue = await reveal(infoName)
    }

    if (infoName === 'telegram' && infoValue) {
      return redirectToTelegram(infoValue)
    }
  }, [ownerInfo, isClientConnected])

  return (
    <UserBlockDiv>
      <div className='user-picture'>
        <img
          src={src}
          alt={alt}
        />
      </div>
      <WalletStatus className='status-section' connected={isClientConnected} />
      <div className='name-section'>
        <span>{`${pageName}.1`}</span>
        {walletAddress && <span>{`${truncateAddressString(walletAddress, 5)}`}</span>}
      </div>
      <div className='user-profile-text'>
        Insert your bio here
      </div>
      <div className='social-networks'>
        {SOCIAL_MEDIA.map((icon, index) => (
          <SocialMediaIcon onClick={() => handleSocialClick(icon)} url={icon.url} key={index}>
            {icon.icon}
          </SocialMediaIcon>
        ))}
      </div>
    </UserBlockDiv>
  )
}

export default UserBlock
