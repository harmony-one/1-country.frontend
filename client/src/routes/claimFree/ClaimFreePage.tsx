import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { observer } from 'mobx-react-lite'
import { useSearchParams } from 'react-router-dom'

import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal, Web3Button } from '@web3modal/react'
import qs from 'qs'

import { sleep } from '../../utils/sleep'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { relayApi, RelayError } from '../../api/relayApi'
import { HomeSearchResultItem } from '../home/components/HomeSearchResultItem'
import { useStores } from '../../stores'
import config from '../../../config'
import { mainApi } from '../../api/mainApi'
import { RESERVED_DOMAINS } from '../../utils/reservedDomains'
import logger from '../../modules/logger'
const log = logger.module('ClaimFreePage')

import { Button } from '../../components/Controls'
import { BaseText } from '../../components/Text'
import { FlexRow } from '../../components/Layout'
import { DomainPrice, DomainRecord } from '../../api'
import { nameUtils, validateDomainName } from '../../api/utils'
import { SearchInput } from '../../components/search-input/SearchInput'
import { FormSearch } from 'grommet-icons/icons/FormSearch'
import { User } from 'grommet-icons/icons/User'

import { Box } from 'grommet/components/Box'
import { Text } from 'grommet/components/Text'
import { Container } from '../home/Home.styles'
import { TextInput } from '../../components/TextInput'
import { ethers } from 'ethers'

const SearchBoxContainer = styled(Box)`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`

interface SearchResult {
  domainName: string
  domainRecord: DomainRecord
  price: DomainPrice
  isAvailable: boolean
  error: string
}

const ClaimFreePage: React.FC = observer(() => {
  const { isConnected, address, connector, status } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, close, isOpen } = useWeb3Modal()
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get('domain') || '')
  const [freeRentKey, setFreeRentKey] = useState(
    searchParams.get('freeRentKey') || ''
  )
  const [claimAddress, setClaimAddress] = useState<string>(address || '')
  const [isLoading, setLoading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  useEffect(() => {
    setClaimAddress(address)
  }, [address])

  const [validation, setValidation] = useState({ valid: true, error: '' })

  const [web2Error, setWeb2Error] = useState(false)
  const [secret] = useState<string>(Math.random().toString(26).slice(2))
  const [regTxHash, setRegTxHash] = useState<string>('')
  const [web2Acquired, setWeb2Acquired] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const { rootStore, ratesStore, walletStore, utilsStore } = useStores()

  useEffect(() => {
    if (status === 'connecting') {
      if (!isOpen && !walletStore.isMetamaskAvailable) {
        // User declined connect with Wallet Connect
        disconnect()
        setProcessStatus({
          type: ProcessStatusTypes.IDLE,
          render: '',
        })
        terminateProcess(0)
      }
    }
  }, [status, isOpen])

  const updateSearch = useMemo(() => {
    return debounce(async (domainName: string) => {
      setSearchResult(null)
      if (domainName) {
        const result = validateDomainName(domainName)
        setValidation(result)

        if (result.valid) {
          try {
            setProcessStatus({
              type: ProcessStatusTypes.PROGRESS,
              render: '',
            })
            setLoading(true)

            const result = await loadDomainRecord(domainName)
            setSearchResult(result)

            setProcessStatus({
              type: ProcessStatusTypes.IDLE,
              render: '',
            })
          } catch (e) {
            console.log('### update search errors', e)
            setProcessStatus({
              type: ProcessStatusTypes.IDLE,
              render: <BaseText>{e.message}</BaseText>,
            })
          } finally {
            setLoading(false)
          }
        }
      } else {
        setValidation({ valid: true, error: '' })
      }
    }, 350)
  }, [rootStore.d1dcClient])

  // setup form from query string
  useEffect(() => {
    if (inputValue) {
      updateSearch(inputValue)
    }
  }, [])

  useEffect(() => {
    if (web2Acquired) {
      const queryString = qs.stringify({
        domain: searchResult.domainName,
      })

      window.location.href = `${config.hostname}/new?${queryString}`
    }
  }, [web2Acquired])

  useEffect(() => {
    const connectWallet = async () => {
      const provider = await connector!.getProvider()
      walletStore.setProvider(provider, claimAddress)
      handleRentDomain()
    }

    if (!walletStore.isMetamaskAvailable) {
      if (isConnected) {
        connectWallet()
      } else {
        // Wallet Connect disconnected, drop to initial state
        if (processStatus.type === ProcessStatusTypes.PROGRESS) {
          terminateProcess(1)
        }
      }
    }
  }, [isConnected])

  const handleSearchChange = (value: string) => {
    setInputValue(value)
    updateSearch(value)
    setWeb2Error(false)

    if (!value && processStatus.type === ProcessStatusTypes.ERROR) {
      setProcessStatus({ type: ProcessStatusTypes.IDLE, render: '' })
    }
  }

  const terminateProcess = async (timer: number = 5000) => {
    await sleep(timer)
    setLoading(false)
  }

  const relayCheck = (_domainName: string) => {
    if (_domainName.length <= 2) {
      return {
        isAvailable: true,
        error: '',
      }
    }
    if (
      _domainName.length === 3 &&
      RESERVED_DOMAINS.find(
        (value) => value.toLowerCase() === _domainName.toLowerCase()
      )
    ) {
      return {
        isAvailable: true,
        error: '',
      }
    }
    return relayApi().checkDomain({
      sld: _domainName,
    })
  }

  const loadDomainRecord = async (_domainName: string) => {
    const [record, price, relayCheckDomain, isAvailable2] = await Promise.all([
      rootStore.d1dcClient.getRecord({ name: _domainName }),
      rootStore.d1dcClient.getPrice({ name: _domainName }),
      relayCheck(_domainName),
      rootStore.d1dcClient.checkAvailable({
        name: _domainName,
      }),
    ])
    console.log('WEB3', _domainName, isAvailable2)
    console.log('WEB2', _domainName, relayCheckDomain.isAvailable)

    return {
      domainName: _domainName,
      domainRecord: record,
      price: price,
      error: relayCheckDomain.error,
      isAvailable: relayCheckDomain.isAvailable && isAvailable2,
    }
  }

  const claimWeb2DomainWrapper = async () => {
    setLoading(true)
    try {
      if (
        searchResult.domainName.length !== 3 ||
        !RESERVED_DOMAINS.find(
          (value) =>
            value.toLowerCase() === searchResult.domainName.toLowerCase()
        )
      ) {
        await claimWeb2Domain(regTxHash)
      }
      await sleep(2000)
      await generateNFT()
      setProcessStatus({
        render: <BaseText>NFT generated.</BaseText>,
      })
      await sleep(2000)
      setProcessStatus({
        render: <BaseText>Web2 domain acquired</BaseText>,
      })
      terminateProcess()
      setWeb2Acquired(true)
    } catch (ex) {
      setWeb2Error(true)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>{`${
            ex instanceof RelayError
              ? ex.message
              : 'Unable to acquire domain. Try Again.'
          }`}</BaseText>
        ),
      })

      log.error('claimWeb2DomainWrapper', {
        error: ex instanceof RelayError ? ex.message : ex,
        domain: `${searchResult?.domainName?.toLowerCase()}${config.tld}`,
        txHash: regTxHash,
        address: walletStore.walletAddress,
      })

      terminateProcess()
    }
  }

  const claimWeb2Domain = async (txHash: string) => {
    const domain = searchResult.domainName + config.tld
    const messages = [
      `contacting dns server`,
      `setting dns record for ${domain}`,
      `verifying dns record for ${domain}`,
      `setting up ${domain}`,
      `creating ${domain} landing page`,
      `adding transaction details of ${domain}`,
      `creating SSL certificate for ${domain}`,
      `verifying SSL certificate for ${domain}`,
      `adding SSL certificate to ${domain}`,
    ]

    let messageIndex = 0

    const createTick = () => {
      return setTimeout(() => {
        messageIndex++
        if (messageIndex > messages.length - 1) {
          return
        }

        const message = messages[messageIndex]
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>{message}</BaseText>,
        })

        createTick()
      }, 10000)
    }

    const timerId = createTick()

    try {
      // @ts-ignore
      const { success, responseText, isRegistered } =
        await relayApi().purchaseDomain({
          domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
          txHash,
          address: walletStore.walletAddress,
        })
      clearTimeout(timerId)
      if (!success && !isRegistered) {
        console.log(`failure reason: ${responseText}`)
        throw new RelayError(
          `Unable to acquire web2 domain. Reason: ${responseText}`
        )
      }
    } catch (error) {
      clearTimeout(timerId)
      console.log('### ex', error?.response?.data)
      throw new RelayError(
        error?.response?.data?.responseText || `Unable to acquire web2 domain`
      )
    }
  }

  const generateNFT = async () => {
    const domain = searchResult.domainName + config.tld
    try {
      await relayApi().genNFT({
        domain,
      })
    } catch (error) {
      console.log(error)
      throw new RelayError(
        error?.response?.data?.responseText || `Unable to genereate the NFT`
      )
    }
  }

  const handleGoToDomain = (searchResult: SearchResult) => {
    window.location.href = `https://${searchResult.domainName.toLowerCase()}${
      config.tld
    }`
  }

  const handleRentDomain = async () => {
    if (!searchResult || !searchResult.domainRecord || !validation.valid) {
      return false
    }

    setLoading(true)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Checking domain</BaseText>,
    })

    console.log('### searchResult', searchResult)

    const _available = await rootStore.d1dcClient.checkAvailable({
      name: searchResult.domainName,
    })
    if (!_available) {
      setValidation({
        valid: false,
        error: 'This domain name is already registered',
      })
      setLoading(false)
      return
    }

    if (!searchResult.domainName) {
      setValidation({
        valid: false,
        error: 'Invalid domain',
      })
      return
    }
    if (!nameUtils.isValidName(searchResult.domainName)) {
      setValidation({
        valid: false,
        error: 'Domain must be alphanumerical characters',
      })
      setLoading(false)
      return
    }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Processing transaction</BaseText>,
    })

    try {
      if (walletStore.isMetamaskAvailable && !walletStore.isConnected) {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Connect Metamask</BaseText>,
        })
        await walletStore.connect()
      } else if (!isConnected) {
        open()
        return
      }
    } catch (e) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{e.message}</BaseText>,
      })
      terminateProcess(1500)
      if (e.name === 'UserRejectedRequestError') {
        open()
      }
      console.log('Connect error:', { e })
      return
    }

    try {
      let txHash

      const rentResult = await mainApi.rentDomainForFree({
        name: searchResult.domainName.toLowerCase(),
        owner: walletStore.walletAddress,
        freeRentKey,
      })

      txHash = rentResult.data.transactionHash

      setRegTxHash(txHash)

      const referral = utilsStore.getReferral()

      mainApi.createDomain({
        domain: searchResult.domainName,
        txHash,
        referral,
      })
      if (
        searchResult.domainName.length !== 3 ||
        !RESERVED_DOMAINS.find(
          (value) =>
            value.toLowerCase() === searchResult.domainName.toLowerCase()
        )
      ) {
        await claimWeb2Domain(txHash)
      }
      setProcessStatus({
        render: <BaseText>Web2 domain acquired.</BaseText>,
      })
      await sleep(2000)
      await generateNFT()
      setProcessStatus({
        render: <BaseText>NFT generated.</BaseText>,
      })
      await sleep(2000)
      terminateProcess()
      setWeb2Acquired(true)
    } catch (ex) {
      setWeb2Error(true)
      setProcessStatus({
        render: (
          <BaseText>{`${
            ex instanceof RelayError
              ? ex.message
              : 'Unable to acquire domain. Try Again.'
          }`}</BaseText>
        ),
      })

      log.error('claimWeb2Domain', {
        error: ex instanceof RelayError ? ex.message : ex,
        domain: `${searchResult?.domainName?.toLowerCase()}${config.tld}`,
        txHash: regTxHash,
        address: walletStore.walletAddress,
      })

      terminateProcess()
    }
  }

  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <SearchBoxContainer>
          {isConnected && !walletStore.isMetamaskAvailable && (
            <Box align={'end'} margin={{ bottom: '16px' }}>
              <Web3Button />
            </Box>
          )}
          <Box justify={'center'} align={'center'} gap="8px">
            {/*<Box width={'100%'} margin={{ top: '16px' }}>*/}
            {/*  <TextInput*/}
            {/*    placeholder="Address 0x..."*/}
            {/*    onChange={(event) => {*/}
            {/*      setClaimAddress(event.target.value)*/}
            {/*    }}*/}
            {/*    icon={<User />}*/}
            {/*    value={claimAddress}*/}
            {/*    isValid={ethers.utils.isAddress(claimAddress)}*/}
            {/*  />*/}
            {/*</Box>*/}
            <Box width={'100%'} margin={{ top: '16px' }}>
              <SearchInput
                isValid={
                  validation.valid &&
                  (searchResult ? searchResult.isAvailable : true)
                }
                allowClear={!isLoading}
                value={inputValue}
                placeholder={'Search domain name'}
                icon={<FormSearch />}
                onSearch={handleSearchChange}
              />
            </Box>
          </Box>
          {validation.valid &&
          !isLoading &&
          searchResult &&
          !web2Acquired &&
          !web2Error ? (
            <Box margin={{ top: '16px' }} gap="12px" align="center">
              <HomeSearchResultItem
                name={searchResult.domainName.toLowerCase()}
                rateONE={ratesStore.ONE_USD}
                domainRecord={searchResult.domainRecord}
                price={freeRentKey ? '0' : searchResult.price.formatted}
                available={searchResult.isAvailable}
                error={searchResult.error}
              />
              {searchResult.isAvailable && (
                <Button disabled={!validation.valid} onClick={handleRentDomain}>
                  Register free domain
                </Button>
              )}
              {!searchResult.isAvailable && validation.valid && (
                <Button
                  $width="auto"
                  disabled={!validation.valid}
                  onClick={() => handleGoToDomain(searchResult)}
                >
                  Go to the domain
                </Button>
              )}
            </Box>
          ) : (
            <Box margin={{ top: '16px' }}>
              {!validation.valid && (
                <Text size={'medium'} style={{ whiteSpace: 'pre-line' }}>
                  {validation.error}
                </Text>
              )}
              {processStatus.type !== ProcessStatusTypes.IDLE && (
                <ProcessStatus status={processStatus} />
              )}
            </Box>
          )}
          {web2Error && (
            <Box align="center">
              <Button onClick={claimWeb2DomainWrapper} disabled={isLoading}>
                TRY AGAIN
              </Button>
            </Box>
          )}
        </SearchBoxContainer>
      </FlexRow>
    </Container>
  )
})

export default ClaimFreePage
