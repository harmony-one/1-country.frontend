import React from 'react'
import { Web3Button } from '@web3modal/react'
import { useDispatch } from 'react-redux'
import { useDisconnect } from 'wagmi'
import { useHistory } from 'react-router'

import { walletLogOut } from '../../utils/store/walletSlice'

import { LogOutButton, SmsWalletButton } from '../Controls'
import { FlexColumn } from '../Layout'

const Wallets = (props) => {
  const { isConnected } = props
  const { disconnect } = useDisconnect()
  const dispatch = useDispatch()
  const history = useHistory()

  const goToLogin = () => {
    history.push('/auth')
  }

  const logOut = () => {
    disconnect()
    dispatch(walletLogOut())
  }

  return (
    <FlexColumn style={{ gap: '0.5em' }}>
      {!isConnected
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
