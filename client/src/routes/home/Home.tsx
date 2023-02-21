import React, { useEffect, useState } from 'react'
import config from '../../../config'
import { useDefaultNetwork } from '../../hooks/network'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import { HomeSearchPage } from './components/HomeSearchPage'
import { getDomainName } from '../../utils/getDomainName'
import { HomePageLoader } from './components/HomePageLoader'
import { HomeDomainPage } from './components/HomeDomainPage'

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

  return <HomeDomainPage />
})

export default Home
