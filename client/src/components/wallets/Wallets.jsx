import React, { useEffect, useState } from 'react'
import { Web3Button } from '@web3modal/react'
import { useDispatch, useSelector } from 'react-redux'
import { useDisconnect, useAccount } from 'wagmi'
import { useHistory } from 'react-router'

import { walletLogOut, selectIsWalletConnected } from '../../utils/store/walletSlice'

import { LogOutButton, SmsWalletButton } from '../Controls'
import { FlexColumn } from '../Layout'

const Wallets = () => {
  const [dispatchLogOut, setDispatchLogOut] = useState(false)
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
    isWalletConnected && setDispatchLogOut(true)
  }

  useEffect(() => {
    dispatchLogOut && dispatch(walletLogOut(false))
  }, [dispatchLogOut])

  return (
    <FlexColumn style={{ gap: '0.5em' }}>
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
