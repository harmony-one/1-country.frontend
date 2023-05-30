import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'

import { WidgetModule } from '../../widgetModule/WidgetModule'
import { widgetListStore } from '../../widgetModule/WidgetListStore'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'
import config from '../../../../config'
import { DomainLevel, getDomainLevel } from '../../../api/utils'
import { getDomainName } from '../../../utils/urlHandler'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../../components/process-status/ProcessStatus'
import { VanityURL } from '../VanityURL'

import { DomainName } from '../../../components/Text'
import { Container, DomainNameContainer } from '../Home.styles'

interface Props {}

const HomeDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [level, setLevel] = useState<DomainLevel>('common')
  const { domainStore, walletStore, metaTagsStore } = useStores()
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  useEffect(() => {
    if (domainName) {
      domainStore.loadDomainRecord(domainName)
      setLevel(getDomainLevel(domainStore.domainName))
    }
  }, [domainName])

  useEffect(() => {
    metaTagsStore.update({
      title: `${domainStore.domainName}${config.tld} | Harmony`,
    })
  }, [domainStore.domainName])

  // const handleClickDomain = () => {
  //   window.open(`mailto:1country@harmony.one`, '_self')
  // }

  const showRenewalBlock =
    walletStore.isConnected &&
    domainStore.isOwner &&
    domainStore.isGoingToExpire()

  return (
    <Container>
      <VanityURL
        record={domainStore.domainRecord}
        name={domainStore.domainName}
      />
      <div style={{ height: '2em' }} />
      <DomainNameContainer>
        <DomainName
          level={level}
          // onClick={handleClickDomain}
          style={{ cursor: widgetListStore.txDomain && 'pointer' }}
        >
          {/* <a href="mailto:1country@harmony.one"></a> */}
          <a href="https://1.country">{domainStore.domainName}.country</a>
        </DomainName>
        {/* {domainStore.domainRecord &&
          domainStore.domainRecord.renter &&
          !domainStore.isExpired && <EmojiSection />} */}
      </DomainNameContainer>

      {domainStore.domainRecord && domainStore.domainRecord.renter && (
        <WidgetModule domainName={domainStore.domainName} />
      )}
      {showRenewalBlock && <DomainRecordRenewal />}
      {/* {domainStore.isOwner && (
        <BgColorSelector
          domainName={domainName}
          bgColor={domainStore.bgColor}
        />
      )} */}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

export default HomeDomainPage
