import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FlexColumn } from '../../components/Layout'
import { GradientText } from '../../components/Text'
import { Container, DescResponsive } from '../home/Home.styles'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import Timer from '@amplication/react-compound-timer'
import { WidgetModule } from '../widgetModule/WidgetModule'
import { Button } from '../../components/Controls'
import config from '../../../config'

import { urlExists } from '../../api/checkUrl'
import { useSearchParams } from 'react-router-dom'
import { relayApi } from '../../api/relayApi'

const WaitingRoom = observer(() => {
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>()
  const [isDomainAvailable, setIsDomainAvailable] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const domainName = searchParams.get('domain')
  const txHash = searchParams.get('txHash')

  const { walletStore } = useStores()
  const navigate = useNavigate()

  const fullUrl = `https://${domainName.toLowerCase()}${config.tld}`

  useEffect(() => {
    if (!domainName) {
      navigate(-1)
    }

    try {
      if (!walletStore.isConnected) {
        walletStore.connect()
      }
    } catch (e) {
      console.log('Error', e)
    }
  }, [])

  const createCert = async (attemptsLeft = 3) => {
    const domain = `${domainName}${config.tld}`

    if (!txHash || !walletStore.walletAddress) {
      return false
    }

    try {
      await relayApi().createCert({
        domain,
        txHash,
        address: walletStore.walletAddress,
      })
    } catch (ex) {
      console.log('### createCert ex', ex)
      if (attemptsLeft === 0) {
        return
      }
      setTimeout(() => {
        createCert(attemptsLeft - 1)
      }, 1000)
    }
  }

  useEffect(() => {
    if (walletStore.walletAddress) {
      createCert()
    }
  }, [walletStore.walletAddress])

  useEffect(() => {
    const checkUrl = async () => {
      if (await urlExists(fullUrl)) {
        setIsDomainAvailable(true)
      } else {
        console.log('not available')
      }
    }

    const interval = setInterval(() => {
      checkUrl()
    }, 15000) //for testing purposes
    setIntervalId(interval)

    return () => clearInterval(interval)
  }, [])

  const goToDomain = () => {
    window.location.assign(fullUrl)
    navigate('/')
  }

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

          <h3 style={{ marginTop: '1em', marginBottom: '0.1em' }}>
            {!isDomainAvailable
              ? `${domainName}.country`
              : `${domainName}.country ready!`}
          </h3>
          {/* <GradientText>{`${domainName}.country`}</GradientText> */}
          {!isDomainAvailable && (
            <GradientText $size="1.17rem" style={{ marginBottom: '0.6em' }}>
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
          )}
          {/* <h3>{`Setting ${domainName}.country`}</h3> */}
          {/* <span className="dot-flashing" style={{ marginBottom: '1em' }} />
          <BaseText style={{ marginBottom: '0.5em', width: '70%' }}>
            While you wait, you can start personalizing your page
          </BaseText> */}
          {isDomainAvailable && (
            <Button
              style={{ marginBottom: '2em', marginTop: '1.5em' }}
              onClick={goToDomain}
            >
              Go!
            </Button>
          )}
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
