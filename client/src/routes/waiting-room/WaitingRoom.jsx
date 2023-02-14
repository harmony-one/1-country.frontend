import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { FlexColumn } from '../../components/Layout'
import PageWidgets from '../../components/page-widgets/PageWidgets'
import { BaseText } from '../../components/Text'
import { Container, DescResponsive } from '../home/Home.styles'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'

const WaitingRoom = observer(() => {
  const { domainName = '' } = useParams()
  const { walletStore } = useStores()

  useEffect(() => {
    try {
      if (!walletStore.isConnected) {
        walletStore.connect()
      }
      // toast.info('Your page is being deployed')
    } catch (e) {
      console.log('Error', e)
    }
  }, [])

  return (
    <Container>
      {walletStore.isConnected && (
        <FlexColumn style={{ width: '100%', alignItems: 'center' }}>
          <h3>{`Setting ${domainName}.country`}</h3>
          {/* <span className="dot-flashing" style={{ marginBottom: '1em' }} />
          <BaseText style={{ marginBottom: '0.5em', width: '70%' }}>
            While you wait, you can start personalizing your page
          </BaseText> */}
          <PageWidgets isOwner style={{ marginTop: '6em' }} showAddButton />
        </FlexColumn>
      )}
      {!walletStore.isConnected && (
        <DescResponsive>
          <h3>Please connect your MetaMask wallet</h3>
        </DescResponsive>
      )}
    </Container>
  )
})

export default WaitingRoom
