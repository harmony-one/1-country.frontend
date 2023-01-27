import { Web3Button } from '@web3modal/react'
import React from 'react'
import { useHistory } from 'react-router'
import { SmsWalletButton } from '../Controls'
import { FlexColumn } from '../Layout'

const Wallets = () => {
  const history = useHistory()

  const goToLogin = () => {
    history.push('/auth')
  }

  return (
    <FlexColumn style={{ gap: '0.5em' }}>
      <SmsWalletButton>
        <button onClick={goToLogin}>SMS WALLET</button>
      </SmsWalletButton>
      <Web3Button />
    </FlexColumn>
  )
}

export default Wallets
