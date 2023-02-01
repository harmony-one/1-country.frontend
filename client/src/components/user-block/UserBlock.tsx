/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useEffect, useRef, useState} from 'react'
import {useWeb3Modal} from '@web3modal/react'
import {useSelector} from 'react-redux'
import {selectPageName} from '../../utils/store/pageSlice'
import {truncateAddressString} from '../../utils/utils'
import {SOCIAL_MEDIA, SocialMedia} from './UserBlock.data'
import {UserBlockDiv} from './UserBlock.styles'
import {toast} from 'react-toastify'
import {WalletStatus} from '../wallets/Wallets'
import {D1DCClient, OWNER_INFO_FIELDS} from "../../api";
import {SocialMediaElement} from "./SocialMediaElement";

const defaultOwnerInfo = {
  telegram: '',
  email: '',
  phone: ''
}

interface Props {
  client: D1DCClient,
  isOwner: boolean,
  walletAddress: string,
  isClientConnected: boolean,
  showSocialMedia?: boolean
}

const UserBlock: React.FC<Props> = (props) => {
  const { isOwner, client, walletAddress, isClientConnected, showSocialMedia = true } = props
  const pageName = useSelector(selectPageName)
  const src = 'https://ipfs.io/ipfs/QmP7ZybNFUgQWKoim9fnFPLBCyoWnZ5GT5acc8MFX9YVuC'
  const alt = 'Image text'
  const [ownerInfo, setOwnerInfo] = useState(defaultOwnerInfo)

  useEffect(() => {
    const getInfo = async () => {
      const info = await client.getAllOwnerInfo({ name: pageName })
      console.log('getInfo', info)
      setOwnerInfo(info)
    }
    if (isOwner) {
      console.log('is owner')
      getInfo()
    }
  }, [])
  console.log('owner Info', ownerInfo)
  useEffect(() => {
    if (!isOwner) {
      setOwnerInfo(defaultOwnerInfo)
    }
  }, [isOwner])

  const toastId = useRef(null)

  const { open } = useWeb3Modal()

  const reveal = async (infoName: OWNER_INFO_FIELDS) => {
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

  const redirectToTelegram = (name: string) => {
    window.open(`https://t.me/${name}`, '_black')
  }

  const handleTelegramClick = async (socialItem: SocialMedia) => {
    if (socialItem.name !== OWNER_INFO_FIELDS.TELEGRAM) {
      return;
    }

    if (!isClientConnected) {
      await open({ route: 'ConnectWallet' })
      return;
    }

    let telegramName = ownerInfo[OWNER_INFO_FIELDS.TELEGRAM]

    if (!telegramName) {
      telegramName = await reveal(OWNER_INFO_FIELDS.TELEGRAM)
    }

    if (telegramName) {
      return redirectToTelegram(telegramName)
    }
  }

  const handleSocialIconClick = async (socialItem: SocialMedia) => {
    if (socialItem.name === OWNER_INFO_FIELDS.TELEGRAM) {
      return handleTelegramClick(socialItem)
    }
  }

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
        {showSocialMedia && SOCIAL_MEDIA.map((item, index) => (
          <SocialMediaElement key={index} data={item} onClick={handleSocialIconClick}  />
        ))}
      </div>
    </UserBlockDiv>
  )
}

export default UserBlock
