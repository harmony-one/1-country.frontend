import React, { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import PageWidgets from '../../components/page-widgets/PageWidgets'
import { Container, DescResponsive } from '../home/Home.styles'

const WaitingRoom = () => {
  const { isConnected } = useAccount()
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
          <h3 style={{color: "#758796"}}>Setting s.country (5min)</h3>
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
