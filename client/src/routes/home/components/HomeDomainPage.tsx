import React from 'react'
import { Container } from '../Home.styles'
import { VanityURL } from '../VanityURL'
import { GradientText } from '../../../components/Text'
import { WidgetModule } from '../../widgetModule/WidgetModule'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'
import { observer } from 'mobx-react-lite'

interface Props {}

export const HomeDomainPage: React.FC<Props> = observer(() => {
  const { domainStore, walletStore } = useStores()

  return (
    <Container>
      <VanityURL
        record={domainStore.domainRecord}
        name={domainStore.domainName}
      />
      <div style={{ height: '2em' }} />
      <GradientText>{domainStore.domainName}.country</GradientText>
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
