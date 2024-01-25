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

interface Props {}

const IndexedDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [tweetId, setTweetId] = useState('')

  const { domainStore, walletStore, metaTagsStore } = useStores()

  useEffect(() => {
    const loadEmbedUrl = async () => {
      const url = await fetchEmbedUrl(domainName)
      if (url) {
        console.log('[XXXX]', url)
        setTweetId(getTweetId(url))
      }
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
      {tweetId !== '' && (
        <div style={{ width: '100%' }}>
          <TweetEmbed tweetId={tweetId} options={{ width: 550 }} />
        </div>
      )}
      {showRenewalBlock && <DomainRecordRenewal />}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

async function fetchEmbedUrl(domain: string) {
  try {
    const response = await axios.get(
      `https://inscription-indexer.fly.dev/tweet/${domain}`
    )
    const url = response.data.replace('x.com', 'twitter.com')
    console.log('[XXX] FETCHED URL:', url)
    return url
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

export default IndexedDomainPage
