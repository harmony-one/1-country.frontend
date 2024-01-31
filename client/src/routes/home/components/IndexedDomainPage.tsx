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
import { MediaWidget } from '../../../components/widgets/MediaWidget'

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

const getTweetId = (url: string) => {
  const regex = /\/status\/(\d+)/
  const match = url.match(regex)
  return match[1]
}

interface Props {
  domainInscription: DomainInscription
}

const IndexedDomainPage: React.FC<Props> = observer((props: Props) => {
  const { domainInscription } = props
  const [domainName] = useState(getDomainName())
  const { domainStore, walletStore, metaTagsStore } = useStores()

  // useEffect(() => {
  //   const loadEmbedUrl = async () => {
  //     const data = await fetchInscriptionData(domainName)
  //     setDomainInscription(data)
  //     console.log('[xx] Fetched domain inscription:', data)
  //   }
  //
  //   if (domainName) {
  //     domainStore.loadDomainRecord(domainName)
  //     loadEmbedUrl()
  //   }
  // }, [domainName])

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
      {domainInscription &&
        domainInscription.type === 'twitter' &&
        domainInscription.url && (
          <div style={{ width: '100%' }}>
            <TweetEmbed
              tweetId={getTweetId(domainInscription.url)}
              options={{ width: 550 }}
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
