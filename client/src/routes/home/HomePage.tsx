import React, { useEffect, useState } from 'react'
import config from '../../../config'
import { useDefaultNetwork } from '../../hooks/network'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import { HomeSearchPage } from './components/HomeSearchPage'
import { getDomainName } from '../../utils/getDomainName'
import { HomePageLoader } from './components/HomePageLoader'
import { HomeDomainPage } from './components/HomeDomainPage'

export const HomePage = observer(() => {
  const [domainName] = useState(getDomainName())

  const { domainStore } = useStores()

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

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
