/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import {Box} from "grommet";
import {useSelector} from 'react-redux'
import {observer} from "mobx-react-lite";
import {selectPageName} from '../../utils/store/pageSlice'
import {truncateAddressString} from '../../utils/utils'
import {UserBlockDiv} from './UserBlock.styles'
import {WalletStatus} from '../wallets/Wallets'
import {D1DCClient} from "../../api";
import {ModalRegister} from '../../modules/modals'
import {ModalIds} from "../../modules/modals";
import {ModalProfileEditBio} from "../modals/ModalProfileEditBio";
import {ButtonSmall} from "../Controls";
import {modalStore} from "../../modules/modals/ModalContext";
import {useStores} from "../../stores";
import {SocialMedia} from "./SocialMedia";

interface Props {
  client: D1DCClient,
  isOwner: boolean,
  walletAddress: string,
  isClientConnected: boolean,
  showSocialMedia?: boolean
}

const UserBlock: React.FC<Props> = observer((props) => {
  const { walletAddress, isClientConnected, isOwner, showSocialMedia = true } = props
  const pageName = useSelector(selectPageName)
  const src = 'https://ipfs.io/ipfs/QmP7ZybNFUgQWKoim9fnFPLBCyoWnZ5GT5acc8MFX9YVuC'
  const alt = 'Image text'


  const handleEditProfile = () => {
    modalStore.showModal(ModalIds.PROFILE_EDIT_SOCIAL)
  }

  const {domainRecordStore} = useStores()

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
      {isOwner && <Box align="center" pad="4px">
        <ButtonSmall onClick={handleEditProfile}>
          Edit Profile
        </ButtonSmall>
      </Box>}
      <div className='user-profile-text'>
        {domainRecordStore.profile.bio || 'Insert your bio here'}
      </div>
      <SocialMedia />

      <ModalRegister layerProps={{position: 'right', full: 'vertical'}} modalId={ModalIds.PROFILE_EDIT_SOCIAL}>
        <ModalProfileEditBio />
      </ModalRegister>
    </UserBlockDiv>
  )
})

export default UserBlock
