import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
// import { toast } from 'react-toastify'
import { useAccount, useConnect } from 'wagmi'
import { FlexColumn } from '../../components/Layout'
import PageWidgets from '../../components/page-widgets/PageWidgets'
import { BaseText } from '../../components/Text'
import { Container, DescResponsive } from '../home/Home.styles'

const WaitingRoom = () => {
  const [name, setName] = useState('')
  const { isConnected } = useAccount()
  const { connect, connectors, isLoading } =
  useConnect()
  const params = useParams();

  useEffect(() => {
    try {
      if (!isConnected && !isLoading && connectors) {
        const con = connectors
        connect({ connector: con }) // { connector: connectors[0] })
      }
      // toast.info('Your page is being deployed')
      if (params.name) {
        setName(params.name)
      }
    } catch (e) {
      console.log('Error', e)
    }
  }, [])


  return (
    <Container>
      <div style={{ height: '2em' }} />
      {isConnected && (
        <FlexColumn style={{ width: '100%', alignItems: 'center' }}>
          <h3>{`Setting ${name}.1.country`}</h3>
          <span className='dot-flashing' style={{ marginBottom: '1em' }}/>
          <BaseText style={{ marginBottom: '0.5em', width: '70%' }}>While you wait, you can start personalizing your page</BaseText>
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
