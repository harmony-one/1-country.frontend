import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import axios from 'axios'

import { VanityURL } from '../VanityURL'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'

import { DomainName } from '../../../components/Text'
import { Container } from '../Home.styles'
import config from '../../../../config'
import { getDomainLevel } from '../../../api/utils'
import { getDomainName } from '../../../utils/urlHandler'

// import { Tweet } from 'react-tweet'
import TweetEmbed from 'react-tweet-embed'
import {MediaWidget} from "../../../components/widgets/MediaWidget";

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

const fetchDomainData = async (domain: string): Promise<DomainInscription> => {
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

interface Props {}

const IndexedDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [tweetId, setTweetId] = useState('')
  const [domainInscription, setDomainInscription] = useState<DomainInscription>()

  const { domainStore, walletStore, metaTagsStore } = useStores()

  useEffect(() => {
    const loadEmbedUrl = async () => {
      const data = await fetchDomainData(domainName)
      setDomainInscription(data)
      console.log('[xx] Fetched domain inscription:', data)
    }

    const getTweetId = (url: string) => {
      const regex = /\/status\/(\d+)/
      const match = url.match(regex)
      return match[1]
    }

    if (domainName) {
      domainStore.loadDomainRecord(domainName)
      loadEmbedUrl()
    }
  }, [domainName])

  useEffect(() => {
    metaTagsStore.update({
      title: `${domainStore.domainName}${config.tld} | Harmony`,
    })
  }, [domainStore.domainName])

  const handleClickDomain = () => {
    window.open(`mailto:1country@harmony.one`, '_self')
  }

  const showRenewalBlock =
    walletStore.isConnected && domainStore.isOwner && domainStore.isExpired

  return (
    <Container>
      <VanityURL
        record={domainStore.domainRecord}
        name={domainStore.domainName}
      />
      <div style={{ height: '2em' }} />
      {domainInscription && domainInscription.url && (
        <div style={{ width: '100%' }}>
          {/*<TweetEmbed tweetId={tweetId} options={{ width: 550 }} />*/}

          <MediaWidget
            domainName={domainName}
            value={domainInscription.url}
            type={'url'}
            uuid={'123'}
            isPinned={false}
            isOwner={domainStore.isOwner}
            onDelete={() => {}}
            onPin={(isPinned: boolean) => {}}
          />
        </div>
      )}
      {showRenewalBlock && <DomainRecordRenewal />}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

export default IndexedDomainPage
