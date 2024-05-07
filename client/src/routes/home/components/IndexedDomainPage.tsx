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

export interface ImagePayload {
  type: string
  bot: string
  prompt: string
  image: string
  imageId: string
}
export interface DomainInscription {
  payload: ImagePayload
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

const IndexedDomainPage: React.FC<Props> = observer((props) => {
  const { domainInscription } = props

  const [domainName] = useState(getDomainName())
  const [tweetId, setTweetId] = useState('')
  const { domainStore, walletStore, metaTagsStore } = useStores()

  useEffect(() => {
    const fetchRedirect = async (path: string) => {
      try {
        const response = await axios.get(
          `https://inscription-indexer.fly.dev/domain/${domainName}/${path}`
        )
        return response.data.url
      } catch (error) {
        console.error('Error fetching redirect link:', error)
      }
    }

    const extractTweetId = (url: string) => {
      const regex = /\/status\/(\d+)/
      const match = url.match(regex)
      return match ? match[1] : ''
    }

    if (currentPath) {
      fetchRedirect(currentPath).then((redirectLink) => {
        if (redirectLink) {
          console.log('### Redirecting:', redirectLink)
          window.location.href = redirectLink
          return
        }
      })
    }

    if (domainInscription && domainInscription.type === 'twitter') {
      const url = domainInscription.url.replace('x.com', 'twitter.com')
      setTweetId(extractTweetId(url))
    }
  }, [domainName, currentPath, domainInscription])

  useEffect(() => {

    if (domainName) {
      domainStore.loadDomainRecord(domainName)
      metaTagsStore.update({
        title: `${domainStore.domainName}${config.tld} | Harmony`,
      })
    }
  }, [domainName, domainStore, metaTagsStore])

  // const showRenewalBlock =
  //   walletStore.isConnected && domainStore.isOwner && domainStore.isExpired

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
        <DalleWidget payload={domainInscription.payload}></DalleWidget>
      )}
      {showRenewalBlock && <DomainRecordRenewal />}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

export default IndexedDomainPage
