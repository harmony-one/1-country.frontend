import React, { useEffect } from 'react'
import styled from 'styled-components'
import { WidgetsContainer } from './Widgets.styles'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'
import { useWeb3Modal, Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'

const Container = styled(WidgetsContainer)`
  border: none;
  border-radius: unset;
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;
  align-items: center;
`

export const WalletConnectWidget: React.FC<{}> = observer(() => {
  const { walletStore } = useStores()
  const { isConnected, address, connector } = useAccount()
  const { open, close } = useWeb3Modal()

  console.log('HOLA DON PEPITO', isConnected, address, connector)

  useEffect(() => {
    connector && console.log('FCO, FOC', connector)
  }, [connector])
  useEffect(() => {
    const connectWallet = async () => {
      const provider = await connector!.getProvider()
      console.log('fpodjfofjsdf', provider)
      walletStore.setProvider(provider, address)
      // close()
      console.log('Connected wallet:', connector.id, address)
    }
    if (!walletStore.isMetamaskAvailable) {
      if (isConnected) {
        console.log('Tryin to connect...')
        connectWallet()
      }
    }
  }, [isConnected])

  return (
    <Container>
      <Web3Button />
    </Container>
  )
})
