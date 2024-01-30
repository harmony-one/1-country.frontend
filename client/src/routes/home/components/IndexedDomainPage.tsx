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

const currentPath = window.location.pathname.replace('/', '')

interface Props {}
const IndexedDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [tweetId, setTweetId] = useState('')

  const { domainStore, walletStore, metaTagsStore } = useStores()

  useEffect(() => {
    const fetchRedirect = async (path: string) => {
      try {
        const response = await axios.get(
          `https://inscription-indexer.fly.dev/domain/${domainName}/${path}`
        )
        console.log('### Redirecting to', response.data.url)
        return response.data.url
      } catch (error) {
        console.error('Error fetching redirect link:', error)
      }
    }

    const fetchDomainData = async () => {
      try {
        const response = await axios.get(
          `https://inscription-indexer.fly.dev/domain/${domainName}`
        )
        const data = response.data
        if (data) {
          const url = data.url.replace('x.com', 'twitter.com')
          setTweetId(extractTweetId(url))
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

    if (currentPath) {
      console.log('### Path:', currentPath)
      fetchRedirect(currentPath).then((redirectLink) => {
        if (redirectLink) {
          window.location.href = redirectLink
        }
      })
      return
    }

    if (domainName) {
      fetchDomainData()
    }
  }, [domainName, currentPath])

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

  if (currentPath) {
    return null // prevent rendering if there's a path that requires redirection
  }

  return (
    <Container>
      <div style={{ height: '2em' }} />
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
