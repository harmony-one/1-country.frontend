import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { isMobile } from 'react-device-detect'

import { WidgetModule } from '../../widgetModule/WidgetModule'
import { widgetListStore } from '../../widgetModule/WidgetListStore'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { HomePageFooter } from './HomePageFooter'
import { useStores } from '../../../stores'
import config from '../../../../config'
import { DomainLevel, getDomainLevel } from '../../../api/utils'
import { getDomainName } from '../../../utils/getDomainName'
import { getQrCode } from '../../../api/qrcode'

import { DomainName } from '../../../components/Text'
import {
  Container,
  DomainNameContainer,
  QrCode,
  QrCodeButton,
  QrContainer,
} from '../Home.styles'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../../components/process-status/ProcessStatus'
import EmojiSection from '../../../components/emoji-section/EmojiSection'
import { BgColorSelector } from './BgColorSelector'
import { VanityURL } from '../VanityURL'
import { FaShareAltSquare } from 'react-icons/fa'

interface Props {}

const HomeDomainPage: React.FC<Props> = observer(() => {
  const [domainName] = useState(getDomainName())
  const [unhideQrCode, setUnhideQrCode] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [level, setLevel] = useState<DomainLevel>('common')
  const { domainStore, walletStore, metaTagsStore } = useStores()
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })
  console.log('isMobile', isMobile)
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

  const showQrCode = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setQrCode(getQrCode({ url: `${domainName}${config.tld}`, size: '300' }))
    setUnhideQrCode(true)
  }

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
          <a href="mailto:1country@harmony.one">
            {domainStore.domainName}.country
          </a>
        </DomainName>
        {domainStore.domainRecord &&
          domainStore.domainRecord.renter &&
          !domainStore.isExpired && <EmojiSection />}
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
      {isMobile && !unhideQrCode && (
        <QrCodeButton onClick={showQrCode}>
          <FaShareAltSquare style={{ width: '4em', height: '3em' }} />
        </QrCodeButton>
      )}
      {unhideQrCode && (
        <QrContainer onClick={() => setUnhideQrCode(false)}>
          <QrCode>
            <img src={qrCode} />
          </QrCode>
        </QrContainer>
      )}
      <HomePageFooter />
      <div style={{ height: 200 }} />
    </Container>
  )
})

export default HomeDomainPage
