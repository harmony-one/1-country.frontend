import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { FlexColumn } from '../../components/Layout'
import { GradientText } from '../../components/Text'
import { Container, DescResponsive } from '../home/Home.styles'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import Timer from '@amplication/react-compound-timer'
import { WidgetModule } from '../widgetModule/WidgetModule'

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
        <FlexColumn style={{ width: '100%', alignItems: 'center', gap: '0' }}>
          {/* <Row style={{  justifyContent: 'center',  }}>
            <h3>{`Setting ${domainName}.country`}</h3>
            <GradientText style={{ fontSize: '1.5rem'}}>
              (<Timer>
                <Timer.Minutes formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}/>:
                <Timer.Seconds formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}/>
              </Timer>)
            </GradientText>
          </Row> */}
          <h3
            style={{ marginTop: '1em', marginBottom: '0.1em' }}
          >Waiting for domain propagation</h3>
          <GradientText>{`${domainName}.country`}</GradientText>
          <GradientText $size="1.17rem" style={{ marginBottom: '0.2em' }}>
            <Timer>
              <Timer.Minutes
                formatValue={(value) => `${value < 10 ? `0${value}` : value}`}
              />
              :
              <Timer.Seconds
                formatValue={(value) => `${value < 10 ? `0${value}` : value}`}
              />
            </Timer>
          </GradientText>
          {/* <h3>{`Setting ${domainName}.country`}</h3> */}
          {/* <span className="dot-flashing" style={{ marginBottom: '1em' }} />
          <BaseText style={{ marginBottom: '0.5em', width: '70%' }}>
            While you wait, you can start personalizing your page
          </BaseText> */}
          <WidgetModule domainName={domainName} />
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
