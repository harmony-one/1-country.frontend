import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import axios from 'axios'

import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'

import { Container } from '../Home.styles'
import config from '../../../../config'
import { getDomainName } from '../../../utils/urlHandler'

import TweetEmbed from 'react-tweet-embed'
import { MediaWidget } from '../../../components/widgets/MediaWidget'
import DalleWidget from '../../../components/widgets/DalleWidget'

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
  type: 'twitter' | 'notion' | 'substack' | 'image' | string
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
    if (domainName) {
      domainStore.loadDomainRecord(domainName)
      metaTagsStore.update({
        title: `${domainStore.domainName}${config.tld} | Harmony`,
      })
    }
  }, [domainName, domainStore, metaTagsStore])

  const showRenewalBlock =
    walletStore.isConnected && domainStore.isOwner && domainStore.isExpired

  return (
    <Container>
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
      {domainInscription && domainInscription.type === 'image' && (
        <DalleWidget inscription={domainInscription.inscription}></DalleWidget>
      )}
      {showRenewalBlock && <DomainRecordRenewal />}

      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

export default IndexedDomainPage
