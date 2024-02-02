import React, { Suspense, lazy, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'

import config from '../../../config'
import { useStores } from '../../stores'

import { HomePageLoader } from './components/HomePageLoader'
import IndexedDomainPage from './components/IndexedDomainPage'
import axios from 'axios'
import { ewsApi } from '../../api/ews/ewsApi'

export interface Inscription {
  id: number
  transactionHash: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  blockNumber: number
  timestamp: number
  payload: object
  createdAt: Date
  updatedAt: Date
}

export interface DomainInscription {
  domain: string
  url: string
  gasPrice: string
  type: 'twitter' | 'notion' | 'substack' | string
  inscription: Inscription
}

const HomeNotionPage = lazy(
  () =>
    import(
      /* webpackChunkName: "HomeNotionPage" */ './components/HomeNotionPage'
    )
)

const HomeSubStackPage = lazy(
  () =>
    import(
      /* webpackChunkName: "HomeNotionPage" */ './components/HomeSubStackPage'
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

const fetchInscriptionData = async (
  domain: string,
  path: string = ''
): Promise<DomainInscription> => {
  const url = `https://inscription-indexer.fly.dev/domain/${domain}${
    path ? `/${path}` : ''
  }`
  try {
    const { data } = await axios.get(url)
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

const currentPath = window.location.pathname.replace('/', '')

export const HomePage = observer(() => {
  const { domainStore } = useStores()
  const { domainName, subdomain } = domainStore
  const [domainInscription, setDomainInscription] =
    useState<DomainInscription>()
  const [notionPageId, setNotionPageId] = useState('')

  console.log(
    'HomePage',
    domainName,
    subdomain,
    'domain inscription:',
    domainInscription
  )

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchInscriptionData(domainName, currentPath)
      setDomainInscription(data)
      try {
        // redirect logic
        if (currentPath) {
          if (data && data.url) {
            window.location.href = data.url // redirect if a URL is found
            return
          } else {
            window.location.href = `/` // redirect to the main domain if no URL field is present
            return
          }
        } else {
          // data.type = 'notion'
          // data.url = 'https://harmonyone.notion.site/Speech-to-Text-benchmark-5bcdc361cf1d4488ac10ab9b1b41e558'
          console.log(`Domain "${domainName}" inscription data:`, data)

          if (data.type === 'notion') {
            const id = await ewsApi.parseNotionPageIdFromRawUrl(data.url)
            setNotionPageId(id)
            console.log('Notion pageId:', id)
          }
        }
      } catch (e) {
        console.error('Cannot load inscriptions data', e)
      }
    }
    if (domainName.length === 2) {
      loadData()
    }
  }, [domainName])

  useEffect(() => {
    const isNewDomain =
      domainName && domainStore.domainRecord && !domainStore.domainRecord.renter
    console.log('isNewDomain', isNewDomain, domainName, domainName.length < 3)
  }, [domainStore.domainRecord])

  if (domainInscription && domainInscription.type === 'substack' && domainInscription.url) {
    return (
      <Suspense fallback={<HomePageLoader />}>
        <HomeSubStackPage url={domainInscription.url} />
      </Suspense>
    )
  }

  if (
    subdomain !== '' ||
    (domainInscription && domainInscription.type === 'notion')
  ) {
    return (
      <Suspense fallback={<HomePageLoader />}>
        <HomeNotionPage pageId={notionPageId} />
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

  if (domainInscription && domainInscription.type === 'twitter') {
    return (
      <Suspense fallback={<HomePageLoader />}>
        <IndexedDomainPage domainInscription={domainInscription} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<HomePageLoader />}>
      <HomeDomainPage />
    </Suspense>
  )
})
