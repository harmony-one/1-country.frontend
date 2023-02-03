import React from 'react'
import { Web3Button } from '@web3modal/react'
import { useDispatch, useSelector } from 'react-redux'
import { useDisconnect, useAccount } from 'wagmi'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import { walletLogOut, selectIsWalletConnected } from '../../utils/store/walletSlice'
import { LogOutButton, SmsWalletButton } from '../Controls'

import { FlexColumn } from '../Layout'
import { WalletStatusCircle, WalletStatusContainer, WalletStatusLabel } from './Wallets.styles'
import { truncateAddressString } from '../../utils/utils'
import { useStores } from '../../stores'

export const WalletStatus = ({ connected = false, className }) => {
  const label = connected ? 'connected' : 'connect wallet'
  const { walletStore } = useStores()
  const onClick = () => {
    console.log('click')
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
        <div style={{ paddingLeft: '4px' }}>{label}</div>
      </WalletStatusLabel>
      {walletStore.walletAddress && <span style={{ paddingLeft: '0.5em' }}>{`${truncateAddressString(walletStore.walletAddress, 5)}`}</span>}
    </WalletStatusContainer>
  )
}

const Wallets = () => {
  const { isConnected } = useAccount()
  const isWalletConnected = useSelector(selectIsWalletConnected)
  const { disconnect } = useDisconnect()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const goToLogin = () => {
    navigate('auth/')
  }

  const logOut = () => {
    isConnected && disconnect()
    isWalletConnected && dispatch(walletLogOut(false))
  }

  return (
    <FlexColumn style={{ gap: '0.5em', alignItems: 'center', maxWidth: '165px' }}>
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
    </FlexColumn>
  )
}

export default Wallets
