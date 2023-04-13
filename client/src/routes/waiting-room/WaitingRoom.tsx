import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FlexColumn } from '../../components/Layout'
import { BaseText, GradientText } from '../../components/Text'
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
import { Web3Button } from '@web3modal/react'
import { Box } from 'grommet/components/Box'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { nameUtils } from '../../api/utils'
import { RESERVED_DOMAINS } from '../../utils/reservedDomains'

const WaitingRoom = observer(() => {
  const [isDomainAvailable, setIsDomainAvailable] = useState(false)
  const [searchParams] = useSearchParams()

  const domainName = searchParams.get('domain') || ''

  const { walletStore, domainStore } = useStores()
  const navigate = useNavigate()

  const fullUrl = `https://${domainName.toLowerCase()}${config.tld}`

  const attemps =
    domainName.length === 3 &&
    RESERVED_DOMAINS.find(
      (value) => value.toLowerCase() === domainName.toLowerCase()
    )
      ? 1
      : 3

  console.log('Cert attemps', attemps)

  useEffect(() => {
    if (!domainName || !nameUtils.isValidName(domainName)) {
      navigate('/')
    }
  }, [])

  useEffect(() => {
    if (domainStore.domainRecord && !domainStore.domainRecord.renter) {
      navigate(`/?domain=${domainName}`)
    }
  }, [domainStore.domainRecord])

  const createCert = async (attemptsLeft = attemps) => {
    const domain = `${domainName}${config.tld}`

    if (!walletStore.walletAddress) {
      return false
    }

    try {
      await relayApi().createCert({
        domain,
      })
    } catch (ex) {
      console.log('### createCert ex', ex)
      if (attemptsLeft === 0) {
        return
      }
      setTimeout(() => {
        createCert(attemptsLeft - 1)
      }, (4 - attemptsLeft) * 3000)
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
          {domainStore.isOwner && !isDomainAvailable && (
            <Box margin={{ bottom: '0.6em' }}>
              <BaseText>
                Customize you page as your domain certificate is generated
              </BaseText>
            </Box>
          )}
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
      {/*<Box>*/}
      {/*  <BaseText>*/}
      {/*    if the certificate is not generated, please{' '}*/}
      {/*    <Link href="mailto: help@harmony.one">contact us</Link>*/}
      {/*  </BaseText>*/}
      {/*</Box>*/}
      {!walletStore.isConnected && (
        <DescResponsive>
          {walletStore.isMetamaskAvailable ? (
            <Box>
              <h3>Please connect your MetaMask wallet</h3>
              <MetamaskWidget />
            </Box>
          ) : (
            <Box>
              <h3>Please connect mobile wallet with Wallet Connect</h3>
              <Web3Button />
            </Box>
          )}
        </DescResponsive>
      )}
    </Container>
  )
})

export default WaitingRoom
