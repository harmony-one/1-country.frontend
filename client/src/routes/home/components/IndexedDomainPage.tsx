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

import TweetEmbed from 'react-tweet-embed'
import Web3 from 'web3'

interface Props {}
const IndexedDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [tweetId, setTweetId] = useState('')
  // const [bidPrice, setBidPrice] = useState('')

  const { domainStore, walletStore, metaTagsStore } = useStores()

  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        const response = await axios.get(
          `https://inscription-indexer.fly.dev/domain/${domainName}`
        )
        const data = response.data
        if (data) {
          const url = data.url.replace('x.com', 'twitter.com')
          setTweetId(extractTweetId(url))
          // setBidPrice(data.gasPrice)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const extractTweetId = (url: string) => {
      const regex = /\/status\/(\d+)/
      const match = url.match(regex)
      return match ? match[1] : ''
    }

    if (domainName) {
      fetchDomainData()
    }
  }, [domainName])

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
      <VanityURL
        record={domainStore.domainRecord}
        name={domainStore.domainName}
      />
      <div style={{ height: '2em' }} />
      {/* {bidPrice && (
        <small>Highest Bid: {Web3.utils.fromWei(bidPrice, 'gwei')} GWEI</small>
      )} */}
      {tweetId && (
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

export default IndexedDomainPage
