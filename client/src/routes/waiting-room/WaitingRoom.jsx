import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useConnect } from 'wagmi'
import { FlexColumn } from '../../components/Layout'
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
      toast.info('Your page is being deployed')
    } catch (e) {
      console.log('Error', e)
    }
  }, [])


  return (
    <Container>
      <div style={{ height: '2em' }} />
      {isConnected && (
        <FlexColumn style={{ width: '100%' }}>
          <h3>Setting s.country (5min)</h3>
          <PageWidgets isOwner style={{ marginTop: '6em' }} showAddButton />
        </FlexColumn>
        )}
      {!isConnected && (
        <DescResponsive>
          <h3>Please connect your MetaMask wallet</h3>
        </DescResponsive>)}
    </Container>
  )
}

export default WaitingRoom
