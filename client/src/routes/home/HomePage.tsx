import React, { Suspense, lazy, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'

import config from '../../../config'
import { useStores } from '../../stores'

import { HomePageLoader } from './components/HomePageLoader'
import IndexedDomainPage, {
  DomainInscription,
} from './components/IndexedDomainPage'
import axios from 'axios'
import { ewsApi } from '../../api/ews/ewsApi'

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

const fetchInscriptionData = async (
  domain: string,
  path: string = ''
): Promise<DomainInscription> => {
  const url = `https://inscription-indexer.fly.dev/domain/${domain}${
    path ? `/${path}` : ''
  }`
  try {
    const { data } = await axios.get(url)
    // const data = {
    //   "domain": "67",
    //   "url": "https://twitter.com/ACK14232856/status/1752662505435091229",
    //   "type": "image",
    //   "gasPrice": "100000000000",
    //   "blockNumber": 53062651,
    //   "inscription": {
    //     "id": 5263,
    //     "transactionHash": "0x2789be59e35ef1fef8e0918d98520d24b91479c70f1893f492324e16421e1e67",
    //     "from": "0x946E363d70864A9C58A1D6c0Fc99898edc70AA99",
    //     "to": "0x3abf101D3C31Aec5489C78E8efc86CaA3DF7B053",
    //     "value": "0",
    //     "gas": "21928",
    //     "gasPrice": "100000000000",
    //     "chain": "",
    //     "blockNumber": 53062651,
    //     "timestamp": 1706707342,
    //     "payload": {
    //       "type":"image",
    //       "prompt":"kids playing D&D in a cave at candlelight",
    //       "imageId":"AgACAgQAAxkDAAIe0GW6rd_t2boqg00oniFXCGqywKCxAALlsjEbtnfUUc0eUu_kV7tdAQADAgADeQADNAQ"
    //     },
    //     "createdAt": "2024-01-31T13:22:25.556Z",
    //     "updatedAt": "2024-01-31T13:22:25.556Z"
    //   }
    // }
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

  if (
    domainInscription &&
    (domainInscription.type === 'twitter' || domainInscription.type === 'image')
  ) {
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
