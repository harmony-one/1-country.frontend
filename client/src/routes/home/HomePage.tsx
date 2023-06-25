import React, { Suspense, lazy, useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import config from '../../../config'
import { useStores } from '../../stores'

import { HomePageLoader } from './components/HomePageLoader'

const qrPath = 'qr?qr-code'

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
    console.log('isNewDomain', isNewDomain, domainName, domainName.length < 3)
    if (isNewDomain) {
      if (domainName.length > 2) {
        window.location.href = `${config.hostname}?domain=${domainName}`
      } else {
        // Below if statement prevents the repetitive addition of "qrPath"
        if (!window.location.href.includes(qrPath)) {
          window.location.href = `${window.location.href}${qrPath}`
        }
      }
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
