import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import { VanityURL } from '../VanityURL'
import { WidgetModule } from '../../widgetModule/WidgetModule'
import { widgetListStore } from '../../widgetModule/WidgetListStore'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'

import { DomainName } from '../../../components/Text'
import { Container } from '../Home.styles'
import config from '../../../../config'
import { getDomainLevel } from '../../../api/utils'

interface Props {}

export const HomeDomainPage: React.FC<Props> = observer(() => {
  const { domainStore, walletStore } = useStores()

  useEffect(() => {
    widgetListStore.loadDomainTx(domainStore.domainName)
  }, [domainStore.domainName])

  const goToTx = () => {
    if (widgetListStore.txDomain) {
      window.open(config.explorer.tx + widgetListStore.txDomain, '_blank')
    }
  }

  return (
    <Container>
      <VanityURL
        record={domainStore.domainRecord}
        name={domainStore.domainName}
      />
      <div style={{ height: '2em' }} />
      <DomainName
        level={getDomainLevel(domainStore.domainName)}
        onClick={goToTx}
        style={{ cursor: widgetListStore.txDomain && 'pointer' }}
      >
        hello@{domainStore.domainName}
      </DomainName>
      {domainStore.domainRecord && domainStore.domainRecord.renter && (
        <WidgetModule domainName={domainStore.domainName} />
      )}
      {walletStore.walletAddress && (
        <>
          {domainStore.isOwner && domainStore.isExpired && (
            <DomainRecordRenewal />
          )}
        </>
      )}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})
