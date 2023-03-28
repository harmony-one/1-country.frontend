import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { toast } from 'react-toastify'

import { VanityURL } from '../VanityURL'
import { WidgetModule } from '../../widgetModule/WidgetModule'
import { widgetListStore } from '../../widgetModule/WidgetListStore'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'

import { DomainName } from '../../../components/Text'
import { Container, DomainNameContainer, TipPageButton } from '../Home.styles'
import config from '../../../../config'
import { DomainLevel, getDomainLevel } from '../../../api/utils'
import { getDomainName } from '../../../utils/getDomainName'
import { ModalIds, ModalRegister } from '../../../modules/modals'
import { modalStore } from '../../../modules/modals/ModalContext'
import { ModalTipPage } from '../../../components/modals/ModalTipPage'

interface Props {}

const HomeDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [level, setLevel] = useState<DomainLevel>('common')
  const { domainStore, walletStore, metaTagsStore } = useStores()

  // useEffect(() => {
  //   widgetListStore.loadDomainTx(domainStore.domainName)
  // }, [domainStore.domainName])
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

  const handleClickDomain = () => {
    window.open(`mailto:1country@harmony.one`, '_self')
  }

  const openModal = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()
    if (walletStore.isConnected) {
      modalStore.showModal(ModalIds.TIP_PAGE)
    } else {
      toast.error('Plase connect your wallet', { autoClose: 2000 })
    }
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
      <DomainNameContainer>
        <DomainName
          level={level}
          onClick={handleClickDomain}
          style={{ cursor: widgetListStore.txDomain && 'pointer' }}
        >
          {domainStore.domainName}.country
        </DomainName>
        {domainStore.domainRecord && domainStore.domainRecord.renter && (
          <TipPageButton>
            <button onClick={openModal}>Tip me!</button>
          </TipPageButton>
        )}
      </DomainNameContainer>

      {domainStore.domainRecord && domainStore.domainRecord.renter && (
        <WidgetModule domainName={domainStore.domainName} />
      )}
      {showRenewalBlock && <DomainRecordRenewal />}
      <HomePageFooter />
      <div style={{ height: 200 }} />
      <ModalRegister
        layerProps={{ position: 'center', full: false }}
        modalId={ModalIds.TIP_PAGE}
      >
        {(modalProps) => (
          <ModalTipPage
            domainLevel={level}
            domainName={`${domainName}${config.tld}`}
            ownerAddress={domainStore.domainRecord.renter}
            {...modalProps}
          />
        )}
      </ModalRegister>
    </Container>
  )
})

export default HomeDomainPage
