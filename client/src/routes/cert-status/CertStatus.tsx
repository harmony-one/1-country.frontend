import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'

import { useStores } from '../../stores'
import config from '../../../config'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { relayApi } from '../../api/relayApi'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { getDomainLevel } from '../../api/utils'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'

import { Box } from 'grommet/components/Box'
import { FlexColumn, FlexRow } from '../../components/Layout'
import { BaseText, DomainName } from '../../components/Text'
import { Container, DomainNameContainer } from '../home/Home.styles'
import { sleep } from '../../utils/sleep'
import { useNavigate } from 'react-router'

const CertStatus = observer(() => {
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })
  const navigate = useNavigate()
  const { domainStore, walletStore } = useStores()
  const { domainName } = domainStore
  const level = getDomainLevel(domainStore.domainName)

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  const checkCertificate = async () => {
    try {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Checking certificate status</BaseText>,
      })
      await sleep(2500)
      const resp = await relayApi().createCert({
        domain: `${domainName}${config.tld}`,
      })
      if (!resp.success) {
        const error = resp.error.charAt(0).toUpperCase() + resp.error.slice(1)
        let renderText = ''
        switch (error) {
          case 'Domain expired':
            renderText = 'The domain has expired; please renew the domain.'
            break
          case 'Certificate generation failed; a support ticket has been created.':
            renderText = error
            setProcessStatus({
              type: ProcessStatusTypes.PROGRESS,
              render: <BaseText>The Certificate is being renewed...</BaseText>,
            })
            await sleep(4000)
            break
          default:
            renderText = error
        }
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: <BaseText>{renderText}</BaseText>,
        })
      } else {
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: <BaseText>The certificate has been renewed</BaseText>,
        })
      }
    } catch (ex) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            There was an error while checking the certificate status; a support
            ticket has been created
          </BaseText>
        ),
      })
      console.log('checkCertificate error:', ex)
    }
  }

  useEffect(() => {
    if (walletStore.isConnected && domainName && domainStore.isOwner) {
      checkCertificate()
    } else {
      if (!domainName) {
        navigate('/')
      }
      if (!domainStore.isOwner) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>You are not the owner of this domain</BaseText>,
        })
      }
      if (!walletStore.isConnected) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>Please connect your wallet</BaseText>,
        })
      }
    }
  }, [walletStore.isConnected, domainName, domainStore.isOwner])

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
