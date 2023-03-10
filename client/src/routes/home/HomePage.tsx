import React, { Suspense, lazy, useEffect, useState } from 'react'
import config from '../../../config'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import { getDomainName } from '../../utils/getDomainName'
import { HomePageLoader } from './components/HomePageLoader'

const HomeSearchPage = lazy(
  () =>
    import(
      /* webpackChunkName: "HomeSearchPage" */ './components/HomeSearchPage'
    )
)
const HomeDomainPage = lazy(
  () =>
    import(
      /* webpackChunkName: "HomeDomainPage" */ './components/HomeDomainPage'
    )
)

export const HomePage = observer(() => {
  const [domainName] = useState(getDomainName())

  const { domainStore } = useStores()

  // useDefaultNetwork()

  useEffect(() => {
    const isNewDomain =
      domainName && domainStore.domainRecord && !domainStore.domainRecord.renter
    if (isNewDomain) {
      window.location.href = `${config.hostname}?domain=${domainName}`
    }
  }, [domainStore.domainRecord])

  if (domainName === '') {
    return (
      <Suspense fallback={<HomePageLoader />}>
        <HomeSearchPage />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<HomePageLoader />}>
      <HomeDomainPage />
    </Suspense>
  )
})
