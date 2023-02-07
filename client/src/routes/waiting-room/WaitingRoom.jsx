import React, { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { Button } from '../../components/Controls'
import PageWidgets from '../../components/page-widgets/PageWidgets'
import { Container, DescResponsive } from '../home/Home.styles'

const WaitingRoom = () => {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isLoading } =
  useConnect()

  useEffect(() => {
    try {
      if (!isConnected && !isLoading && connectors) {
      const con = connectors
      connect({ connector: con }) // { connector: connectors[0] })
      }
    } catch (e) {
      console.log('Error', e)
    }
  }, [])


  return (
    <Container>
      {isConnected && (
        <DescResponsive>
          <h3>While your domain is being generated... <br />please start personalizing your space</h3>
          <PageWidgets isOwner style={{ marginTop: '6em' }} showAddButton />
        </DescResponsive>)}
      {!isConnected && (
        <DescResponsive>
          <h3>Please connect your MetaMask wallet</h3>
        </DescResponsive>)}
    </Container>
  )
}

export default WaitingRoom
