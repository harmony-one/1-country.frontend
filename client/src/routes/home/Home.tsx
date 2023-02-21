import React, { useEffect, useState } from 'react'
import config from '../../../config'
import { GradientText, SmallTextGrey } from '../../components/Text'
import { Container } from './Home.styles'
import { VanityURL } from './VanityURL'
import { useDefaultNetwork } from '../../hooks/network'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import { HomeSearchPage } from './components/HomeSearchPage'
import { getDomainName } from '../../utils/getDomainName'
import { HomePageLoader } from './components/HomePageLoader'
import { WidgetModule } from '../widgetModule/WidgetModule'
import { HomePageFooter } from './components/HomePageFooter'
import { DomainRecordRenewal } from './components/DomainRecordRenewal'

const Home = observer(() => {
  const [domainName] = useState(getDomainName())

  const { domainStore, walletStore } = useStores()

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  useDefaultNetwork()

  useEffect(() => {
    if (!walletStore.isConnected && !walletStore.isConnecting) {
      walletStore.connect()
    }
  }, [])

  useEffect(() => {
    const isNewDomain =
      domainName && domainStore.domainRecord && !domainStore.domainRecord.renter
    if (isNewDomain) {
      window.location.href = `${config.hostname}?domain=${domainName}`
    }
  }, [domainStore.domainRecord])

  if (domainName === '') {
    return <HomeSearchPage />
  }

  if (domainName && !domainStore.domainRecord) {
    return <HomePageLoader />
  }

  return (
    <Container>
      <VanityURL record={domainStore.domainRecord} name={domainName} />
      <div style={{ height: '2em' }} />
      <GradientText>{domainName}.country</GradientText>
      {domainStore.domainRecord && domainStore.domainRecord.renter && (
        <WidgetModule domainName={domainName} />
      )}
      {walletStore.walletAddress && (
        <>
          {domainStore.isOwner && domainStore.isExpired && (
            <DomainRecordRenewal />
          )}
          <SmallTextGrey>
            Your address: {walletStore.walletAddress}
          </SmallTextGrey>
        </>
      )}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

export default Home
