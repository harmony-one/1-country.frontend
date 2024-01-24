import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import axios from 'axios'

import { VanityURL } from '../VanityURL'
import { widgetListStore } from '../../widgetModule/WidgetListStore'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'

import { DomainName } from '../../../components/Text'
import { Container } from '../Home.styles'
import config from '../../../../config'
import { getDomainLevel } from '../../../api/utils'
import { getDomainName } from '../../../utils/getDomainName'

interface Props {}

const IndexedDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [embedUrl, setEmbedUrl] = useState('')

  const { domainStore, walletStore, metaTagsStore } = useStores()

  useEffect(() => {
    const loadEmbedUrl = async () => {
      const url = await fetchEmbedUrl(domainName)
      if (url) {
        const encodedUrl = encodeURIComponent(url)
        console.log('[XXXX]', encodedUrl)
        setEmbedUrl(`https://twitframe.com/show?url=${encodedUrl}`)
      }
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
      <DomainName
        level={getDomainLevel(domainStore.domainName)}
        onClick={handleClickDomain}
        style={{ cursor: widgetListStore.txDomain && 'pointer' }}
      >
        {domainStore.domainName}.country
      </DomainName>
      {embedUrl !== '' && (
        <iframe
          src={embedUrl}
          width="550"
          height="500"
          style={{ border: 'none' }}
          title="Embedded Content"
        />
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
      `https://dot-country-indexer.fly.dev/domain/${domain}`
    )
    const url = response.data.url
    console.log('[XXX] FETCHED URL:', url)
    return url
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

export default IndexedDomainPage
