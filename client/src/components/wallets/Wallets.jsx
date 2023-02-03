import React from 'react'
import { Web3Button } from '@web3modal/react'
import { useDispatch, useSelector } from 'react-redux'
import { useDisconnect, useAccount } from 'wagmi'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import { walletLogOut, selectIsWalletConnected } from '../../utils/store/walletSlice'
import { LogOutButton, SmsWalletButton } from '../Controls'

import { WalletsContainer, WalletStatusCircle, WalletStatusContainer, WalletStatusLabel } from './Wallets.styles'
import { truncateAddressString } from '../../utils/utils'
import { useStores } from '../../stores'

export const WalletStatus = ({ connected = false, className }) => {
  const label = connected ? 'connected ' : 'connect wallet'
  const { walletStore } = useStores()
  const onClick = (event) => {
    toast(<Wallets />, {
      position: 'top-center',
      closeOnClick: true,
      hideProgressBar: true,
      autoClose: 3500,
    })
  }

  return (
    <WalletStatusContainer className={className} onClick={onClick}>
      <WalletStatusLabel>
        <WalletStatusCircle connected={connected} />
        <span style={{ paddingLeft: '0.4em', paddingRight: '0.7em' }}>{label}</span>
      </WalletStatusLabel>
      {walletStore.walletAddress && <span style={{ }}>{`${truncateAddressString(walletStore.walletAddress, 5)}`}</span>}
    </WalletStatusContainer>
  )
}

const Wallets = () => {
  const { isConnected } = useAccount()
  const isWalletConnected = useSelector(selectIsWalletConnected)
  const { walletStore } = useStores()
  const { disconnect } = useDisconnect()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const goToLogin = () => {
    navigate('auth/')
  }

  const logOut = () => {
    isConnected && disconnect()
    isWalletConnected && dispatch(walletLogOut(false))
    walletStore.isConnected = false
    walletStore.walletAddress = ''
  }

  return (
    <WalletsContainer>
      {(!isConnected && !isWalletConnected)
        ? (
          <>
            <SmsWalletButton>
              <button onClick={goToLogin}>SMS Wallet</button>
            </SmsWalletButton>
            <Web3Button />
          </>)
        : (
          <LogOutButton>
            <button onClick={logOut}>Log out</button>
          </LogOutButton>)}
    </WalletsContainer>
  )
}

export default Wallets
