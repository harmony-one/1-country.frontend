import React from 'react'
import { Web3Button } from '@web3modal/react'
import { useDispatch, useSelector } from 'react-redux'
import { useDisconnect, useAccount } from 'wagmi'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'

import { walletLogOut, selectIsWalletConnected } from '../../utils/store/walletSlice'
import { LogOutButton, SmsWalletButton } from '../Controls'

import { FlexColumn } from '../Layout'
import { WalletStatusCircle, WalletStatusContainer } from './Wallets.styles'

export const WalletStatus = ({ connected = false, className }) => {
  const label = connected ? 'connected' : 'connect wallet'

  const onClick = () => {
    console.log('click')
    toast(<Wallets />, {
      position: 'top-center',
      closeOnClick: true,
      hideProgressBar: true,
      autoClose: false,
    })
  }

  return (
    <WalletStatusContainer className={className} onClick={onClick}>
      <WalletStatusCircle connected={connected} />
      <div style={{ paddingLeft: '4px' }}>{label}</div>
    </WalletStatusContainer>
  )
}

const Wallets = () => {
  const { isConnected } = useAccount()
  const isWalletConnected = useSelector(selectIsWalletConnected)
  const { disconnect } = useDisconnect()
  const dispatch = useDispatch()
  const history = useHistory()

  const goToLogin = () => {
    history.push('/auth')
  }

  const logOut = () => {
    isConnected && disconnect()
    isWalletConnected && dispatch(walletLogOut(false))
  }

  return (
    <FlexColumn style={{ gap: '0.5em', alignItems: 'center' }}>
      {(!isConnected && !isWalletConnected)
        ? (
          <>
            <SmsWalletButton>
              <button onClick={goToLogin}>SMS WALLET</button>
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
