import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FlexColumn, FlexRow } from '../../components/Layout'
import { BaseText, DomainName, GradientText } from '../../components/Text'
import {
  Container,
  DescResponsive,
  DomainNameContainer,
} from '../home/Home.styles'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import Timer from '@amplication/react-compound-timer'
import { WidgetModule } from '../widgetModule/WidgetModule'
import { Button } from '../../components/Controls'
import config from '../../../config'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'

import { urlExists } from '../../api/checkUrl'
import { useSearchParams } from 'react-router-dom'
import { relayApi } from '../../api/relayApi'
import { Web3Button } from '@web3modal/react'
import { Box } from 'grommet/components/Box'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { DomainLevel, getDomainLevel, nameUtils } from '../../api/utils'
import { RESERVED_DOMAINS } from '../../utils/reservedDomains'
import { VanityURL } from '../home/VanityURL'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'

const CertStatus = observer(() => {
  const [loading, setLoading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })
  const { domainStore, walletStore } = useStores()
  const { domainName } = domainStore
  const level = getDomainLevel(domainStore.domainName)

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  const checkCertificate = async () => {
    console.log('sdkfhdskjjskfkdsf dshfkdsfhsdkjfsjf ksjdf ksdhkfh')
    const fco = await relayApi().certStatus({
      domain: `${domainName}${config.tld}`,
    })
    console.log('checkCertificate', fco)
  }

  useEffect(() => {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Checking certificate status</BaseText>,
    })
    domainName && checkCertificate()
  }, [])

  return (
    <Container>
      <div style={{ height: '2em' }} />
      <FlexColumn style={{ width: '100%', alignItems: 'center', gap: '0' }}>
        <DomainNameContainer>
          <DomainName level={level}>
            {domainStore.domainName}.country
          </DomainName>
        </DomainNameContainer>
        <div style={{ height: '2em' }} />
        <span>Certificate status</span>
        {processStatus.type !== ProcessStatusTypes.IDLE && (
          <Box align={'center'}>
            <ProcessStatus status={processStatus} />
          </Box>
        )}
        <div style={{ height: '2em' }} />
        {domainStore.domainRecord && <TransactionWidget name={domainName} />}
        <FlexRow>
          {!walletStore.isConnected && walletStore.isMetamaskAvailable && (
            <MetamaskWidget />
          )}
          <WalletConnectWidget />
        </FlexRow>
      </FlexColumn>
    </Container>
  )
})

export default CertStatus
