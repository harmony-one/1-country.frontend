import React from 'react'
import { useAccount } from 'wagmi'
import PageWidgets from '../../components/page-widgets/PageWidgets'
import { Container, DescResponsive } from '../home/Home.styles'

const WaitingRoom = () => {
  const { isConnected, address } = useAccount()

  return (
    <Container>
      <DescResponsive>
        <h3>While your domain is being generated... <br />please start personalizing your space</h3>
        <PageWidgets isOwner style={{ marginTop: '6em' }} showAddButton />
      </DescResponsive>
    </Container>
  )
}

export default WaitingRoom
