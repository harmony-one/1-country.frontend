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
import { DomainLevel, getDomainLevel } from '../../api/utils'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'
import { getDomainName } from '../../utils/urlHandler'
import { DomainRecord } from '../../api'
import { sleep } from '../../utils/sleep'

import { FormSearch } from 'grommet-icons/icons/FormSearch'
import { Box } from 'grommet/components/Box'
import { FlexColumn, FlexRow } from '../../components/Layout'
import { BaseText, DomainName } from '../../components/Text'
import { Container, DomainNameContainer } from '../home/Home.styles'
import { SearchInput } from '../../components/search-input/SearchInput'

const CertStatus = observer(() => {
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })
  const [isLoading, setIsloading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [record, setRecord] = useState<DomainRecord>()
  const [isOwner, setIsOwner] = useState(false)
  const { walletStore } = useStores()
  const [domainName, setDomainName] = useState(getDomainName())
  const [level, setLevel] = useState<DomainLevel>()
  const client = walletStore.getDCClient()

  const getDomainRecord = async (domain: string) => {
    const record = await client.getRecord({ name: domain })
    console.log(record)
    if (record.renter) {
      setDomainName(domain)
      setRecord(record)
      setIsOwner(
        record.renter.toLocaleLowerCase() ===
          walletStore.walletAddress.toLocaleLowerCase()
      )
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>The domain doesn't exists</BaseText>,
      })
    }
  }

  useEffect(() => {
    if (domainName && !record) {
      setLevel(getDomainLevel(domainName))
      getDomainRecord(domainName)
      inputValue === '' && setInputValue(domainName)
    }
  }, [domainName])

  useEffect(() => {
    if (inputValue === '') {
      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
    }
  }, [inputValue])

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
      setIsloading(false)
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
    if (walletStore.isConnected && record && isOwner) {
      setIsloading(true)
      checkCertificate()
    } else {
      if (record && !isOwner) {
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
  }, [walletStore.isConnected, record, isOwner])

  const onChange = (value: string) => {
    setInputValue(value)
  }

  const enterHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    const value = (event.target as HTMLInputElement).value || ''
    console.log(value)
    try {
      getDomainRecord(value)
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    <Container>
      <div style={{ height: '2em' }} />
      <FlexColumn style={{ width: '100%', alignItems: 'center', gap: '0' }}>
        <DomainNameContainer>
          <DomainName level={level}>{domainName}.country</DomainName>
        </DomainNameContainer>
        <div style={{ height: '2em' }} />
        <span>Certificate status</span>
        <Box
          width={'100%'}
          margin={{ top: '16px' }}
          style={{ paddingBottom: '1em' }}
        >
          <SearchInput
            disabled={isLoading}
            onSearch={onChange}
            value={inputValue}
            placeholder={'Please enter the domain to check'}
            icon={<FormSearch />}
            onKeyDown={enterHandler}
          />
        </Box>
        {processStatus.type !== ProcessStatusTypes.IDLE && (
          <Box align={'center'}>
            <ProcessStatus status={processStatus} />
          </Box>
        )}
        <div style={{ height: '2em' }} />
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
