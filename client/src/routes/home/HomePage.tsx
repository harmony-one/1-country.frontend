import React, { Suspense, lazy, useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import config from '../../../config'
import { useStores } from '../../stores'

import { HomePageLoader } from './components/HomePageLoader'

const HomeNotionPage = lazy(
  () =>
    import(
      /* webpackChunkName: "HomeNotionPage" */ './components/HomeNotionPage'
    )
)

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
  const { domainStore } = useStores()
  const { domainName, subdomain } = domainStore

  console.log('HomePage', domainName, subdomain)

  useEffect(() => {
    const isNewDomain =
      domainName && domainStore.domainRecord && !domainStore.domainRecord.renter
    if (isNewDomain) {
      window.location.href = `${config.hostname}?domain=${domainName}`
    }
  }, [domainStore.domainRecord])

  if (subdomain !== '') {
    return (
      <Suspense fallback={<HomePageLoader />}>
        <HomeNotionPage />
      </Suspense>
    )
  }
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
