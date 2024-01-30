import React, {Suspense, lazy, useEffect, useState} from 'react'
import { observer } from 'mobx-react-lite'

import config from '../../../config'
import { useStores } from '../../stores'

import { HomePageLoader } from './components/HomePageLoader'
import IndexedDomainPage, {DomainInscription} from './components/IndexedDomainPage'
import axios from "axios";
import {ewsApi} from "../../api/ews/ewsApi";

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

const fetchInscriptionData = async (domain: string): Promise<DomainInscription> => {
  try {
    const { data } = await axios.get(
      `https://inscription-indexer.fly.dev/domain/${domain}`
    )
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

export const HomePage = observer(() => {
  const { domainStore } = useStores()
  const { domainName, subdomain } = domainStore
  const [domainInscription, setDomainInscription] = useState<DomainInscription>()
  const [notionPageId, setNotionPageId] = useState('')

  console.log('HomePage', domainName, subdomain, 'domainInscription:', domainInscription)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchInscriptionData(domainName)
        // data.type = 'notion'
        // data.url = 'https://harmonyone.notion.site/Speech-to-Text-benchmark-5bcdc361cf1d4488ac10ab9b1b41e558'
        setDomainInscription(data)
        console.log(`Domain "${domainName}" inscription data:`, data)

        if(data.type === 'notion') {
          const id = await ewsApi.parseNotionPageIdFromRawUrl(data.url)
          setNotionPageId(id)
          console.log('Notion pageId:', id)
        }
      } catch (e) {
        console.error('Cannot load inscriptions data', e)
      }
    }
    loadData()
  }, []);

  useEffect(() => {
    const isNewDomain =
      domainName && domainStore.domainRecord && !domainStore.domainRecord.renter
    console.log('isNewDomain', isNewDomain, domainName, domainName.length < 3)
  }, [domainStore.domainRecord])

  if (subdomain !== '' || (domainInscription && domainInscription.type === 'notion')) {
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
