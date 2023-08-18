import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { observer } from 'mobx-react-lite'
import BN from 'bn.js'
import { useSearchParams } from 'react-router-dom'

import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal, Web3Button } from '@web3modal/react'
import qs from 'qs'

import { sleep } from '../../../utils/sleep'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../../components/process-status/ProcessStatus'
import { relayApi, RelayError } from '../../../api/relayApi'
import { cutString } from '../../../utils/string'
import { buildTxUri } from '../../../utils/explorer'
import { HomeSearchResultItem } from './HomeSearchResultItem'
import { useStores } from '../../../stores'
import config from '../../../../config'
import { mainApi } from '../../../api/mainApi'
import { RESERVED_DOMAINS } from '../../../utils/reservedDomains'
import logger from '../../../modules/logger'

import { Button, LinkWrapper } from '../../../components/Controls'
import { BaseText, GradientText } from '../../../components/Text'
import { FlexRow, Row } from '../../../components/Layout'
import { DomainPrice, DomainRecord, SendNameExpired } from '../../../api'
import { nameUtils, utils, validateDomainName } from '../../../api/utils'
import { TypedText } from './Typed'
import { SearchInput } from '../../../components/search-input/SearchInput'
import { FormSearch } from 'grommet-icons/icons/FormSearch'
import { Box } from 'grommet/components/Box'
import { Text } from 'grommet/components/Text'
import { Container, DescResponsive, PageCurationSection } from '../Home.styles'
import PageCuration, { PAGE_CURATION_LIST } from './PageCuration'
import { useMinimalRender } from '../../../hooks/useMinimalRender'
import { MetamaskWidget } from '../../../components/widgets/MetamaskWidget'
import { DomainRecordRenewal } from './DomainRecordRenewal'
import { renewCommand } from '../../../utils/command-handler/DcCommandHandler'

const log = logger.module('HomeSearchPage')

const SearchBoxContainer = styled(Box)`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`

export interface SearchResult {
  domainName: string
  domainRecord: DomainRecord
  price: DomainPrice
  isAvailable: boolean
  error: string
  nameExpired: SendNameExpired
  isOwner: boolean
}

const HomeSearchPage: React.FC = observer(() => {
  const { isConnected, address, connector, status } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, close, isOpen } = useWeb3Modal()
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState('')
  const [freeRentKey, setFreeRentKey] = useState(
    searchParams.get('freeRentKey') || ''
  )
  const [isLoading, setLoading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })
  const [validation, setValidation] = useState({ valid: true, error: '' })
  const [web2Error, setWeb2Error] = useState(false)
  const [secret] = useState<string>(Math.random().toString(26).slice(2))
  const [regTxHash, setRegTxHash] = useState<string>('')
  const [web2Acquired, setWeb2Acquired] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isTelegramMode, setIsTelegramMode] = useState(false)
  const {
    rootStore,
    ratesStore,
    walletStore,
    utilsStore,
    domainStore,
    telegramWebAppStore,
  } = useStores()
  const baseRegistrar = rootStore.nameWrapper
  const isMinimalRender = useMinimalRender()

  useEffect(() => {
    let domain = searchParams.get('domain')
    if (!domain) {
      const urls = searchParams.toString().split('=')
      if (urls.length === 2 && urls[1] === '') {
        setInputValue(urls[0])
        updateSearch(urls[0])
      }
    } else {
      updateSearch(domain)
      setInputValue(domain)
    }
    setIsTelegramMode(telegramWebAppStore.isTelegramWebApp)
    if (inputValue) {
      updateSearch(inputValue)
    }
  }, [])

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
    if (web2Acquired) {
      const queryString = qs.stringify({
        domain: searchResult.domainName,
      })

      window.location.href = `${config.hostname}/new?${queryString}`
    }
  }, [web2Acquired])

  console.log('searchResult', searchResult)
  useEffect(() => {
    const updateDomainRecord = async () => {
      const result = await loadDomainRecord(searchResult.domainName)
      setSearchResult(result)
    }
    const connectWallet = async () => {
      const provider = await connector!.getProvider()
      walletStore.setProvider(provider, address)
      handleRentDomain()
    }

    if (searchResult && searchResult.domainName) {
      updateDomainRecord()
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
    updateSearch(value.toLocaleLowerCase())
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

  const isDomainAvailable = (
    isOwner: boolean,
    nameExpired: SendNameExpired,
    web2IsAvailable: boolean,
    web3IsAvailable: boolean
  ) => {
    const expired =
      (nameExpired.isExpired && !nameExpired.isInGracePeriod) ||
      (nameExpired.isExpired &&
        nameExpired.isInGracePeriod &&
        domainStore.isOwner)

    // console.log(
    //   'isDomainAvailable',
    //   nameExpired.expirationDate > 0 && web3IsAvailable && web2IsAvailable,
    //   web2IsAvailable && web3IsAvailable,
    //   nameExpired.isExpired && !nameExpired.isInGracePeriod,
    //   nameExpired.isExpired && nameExpired.isInGracePeriod && isOwner
    // )
    return (
      (nameExpired.expirationDate > 0 && web3IsAvailable && web2IsAvailable) || // requested by Aaron
      (web2IsAvailable && web3IsAvailable) || // initial comparsion
      (nameExpired.isExpired && !nameExpired.isInGracePeriod) ||
      (nameExpired.isExpired && nameExpired.isInGracePeriod && isOwner)
    )
  }

  const loadDomainRecord = async (_domainName: string) => {
    const [record, price, relayCheckDomain, isAvailable2, nameExpired] =
      await Promise.all([
        rootStore.d1dcClient.getRecord({ name: _domainName }),
        rootStore.d1dcClient.getPrice({ name: _domainName }),
        relayCheck(_domainName),
        rootStore.d1dcClient.checkAvailable({
          name: _domainName,
        }),
        rootStore.d1dcClient.checkNameExpired({
          name: _domainName,
        }),
      ])
    let isOwner = false
    if (nameExpired.isExpired && nameExpired.isInGracePeriod) {
      const owner = await baseRegistrar.getWrappedOwner(_domainName)
      isOwner = owner === walletStore.walletAddress
    }
    return {
      domainName: _domainName,
      domainRecord: record,
      price: price,
      error: relayCheckDomain.error,
      isAvailable: isDomainAvailable(
        isOwner,
        nameExpired,
        relayCheckDomain.isAvailable,
        isAvailable2
      ),
      nameExpired,
      isOwner,
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
      console.log('claimWeb2DomainWrapper', {
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
      log.error('claimWeb2Domain', {
        error: error instanceof RelayError ? error.message : error,
        domain: `${searchResult?.domainName?.toLowerCase()}${config.tld}`,
        txHash: regTxHash,
        address: walletStore.walletAddress,
      })
      console.log('claimWeb2Domain', {
        error: error instanceof RelayError ? error.message : error,
        domain: `${searchResult?.domainName?.toLowerCase()}${config.tld}`,
        txHash: regTxHash,
        address: walletStore.walletAddress,
      })
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
      log.error('generateNFT', {
        error: error instanceof RelayError ? error.message : error,
        domain: `${searchResult?.domainName?.toLowerCase()}${config.tld}`,
        txHash: regTxHash,
        address: walletStore.walletAddress,
      })
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

  const handleRenewDomain = async () => {
    setLoading(true)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: (
        <BaseText>{`Renewing ${searchResult.domainName}${config.tld}`}</BaseText>
      ),
    })
    const result = await renewCommand(
      searchResult.domainName,
      walletStore.walletAddress,
      searchResult.price.amount,
      rootStore,
      setProcessStatus
    )
    if (!result.error) {
      await sleep(2000)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: (
          <Button
            $width="auto"
            disabled={!validation.valid}
            onClick={() => handleGoToDomain(searchResult)}
          >
            Go to the domain
          </Button>
        ),
      })
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Unable to renew the domain. Please contact support',
      })
    }
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

    const _available = searchResult.isAvailable

    if (!_available) {
      setValidation({
        valid: false,
        error: 'This domain name is already registered',
      })
      setLoading(false)
      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
      return
    }

    if (!searchResult.domainName) {
      setValidation({
        valid: false,
        error: 'Invalid domain',
      })
      setLoading(false)
      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
      return
    }
    if (!nameUtils.isValidName(searchResult.domainName)) {
      setValidation({
        valid: false,
        error: 'Domain must be alphanumerical characters',
      })
      setLoading(false)
      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
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
        render: <BaseText>{e.reason}</BaseText>,
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

      if (!freeRentKey) {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: (
            <BaseText>
              {walletStore.isMetamaskAvailable
                ? 'Waiting for a transaction to be signed'
                : 'Sign transaction on mobile device'}
            </BaseText>
          ),
        })

        const commitResult = await rootStore.d1dcClient.commit({
          name: searchResult.domainName.toLowerCase(),
          onTransactionHash: () => {
            setProcessStatus({
              type: ProcessStatusTypes.PROGRESS,
              render: <BaseText>Waiting for transaction confirmation</BaseText>,
            })
          },
          secret,
        })
        if (commitResult.error) {
          console.log('Commit result failed:', 'handleRentDomain - commit', {
            error: commitResult.error,
            domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
            wallet: walletStore.walletAddress,
          })
          log.error('handleRentDomain - commit', {
            error: commitResult.error,
            domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
            wallet: walletStore.walletAddress,
          })
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: (
              <BaseText>
                {commitResult.error.reason
                  ? commitResult.error.reason
                  : commitResult.error.message}
              </BaseText>
            ),
          })
          terminateProcess(2500)
          return
        }

        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>
                Reserved {`${searchResult.domainName}${config.tld}`}
              </BaseText>
              (
              <LinkWrapper
                target="_blank"
                type="text"
                href={buildTxUri(commitResult.txReceipt.transactionHash)}
              >
                <BaseText>
                  {cutString(commitResult.txReceipt.transactionHash)}
                </BaseText>
              </LinkWrapper>
              )
            </FlexRow>
          ),
        })

        console.log('Commit result:', commitResult)
        console.log('waiting for 5 seconds...')
        await sleep(5000)

        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: (
            <BaseText>
              {walletStore.isMetamaskAvailable
                ? 'Waiting for a transaction to be signed'
                : 'Sign transaction on mobile device'}
            </BaseText>
          ),
        })

        const rentResult = await rootStore.d1dcClient.rent({
          name: searchResult.domainName.toLowerCase(),
          secret,
          //url: tweetId.toString(),
          owner: walletStore.walletAddress,
          amount: new BN(searchResult.price.amount).toString(),
          onTransactionHash: () => {
            setProcessStatus({
              type: ProcessStatusTypes.PROGRESS,
              render: <BaseText>Waiting for transaction confirmation</BaseText>,
            })
          },
        })
        console.log('rentResult', rentResult)

        if (rentResult.error) {
          log.error('handleRentDomain - rent', {
            error: commitResult.error,
            domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
            wallet: walletStore.walletAddress,
          })
          console.log('handleRentDomain - rent', {
            error: commitResult.error,
            domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
            wallet: walletStore.walletAddress,
          })
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: (
              <BaseText>
                {rentResult.error.reason
                  ? rentResult.error.reason
                  : rentResult.error.message}
              </BaseText>
            ),
          })
          terminateProcess(2500)
          return
        }

        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>
                Registered {`${searchResult.domainName}${config.tld}`} (3 min
                avg)
              </BaseText>
            </FlexRow>
          ),
        })

        txHash = rentResult.txReceipt.transactionHash
      } else {
        const rentResult = await mainApi.rentDomainForFree({
          name: searchResult.domainName.toLowerCase(),
          owner: walletStore.walletAddress,
          freeRentKey,
        })

        txHash = rentResult.data.transactionHash
      }

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
      console.log('claimWeb2Domain', {
        error: ex instanceof RelayError ? ex.message : ex,
        domain: `${searchResult?.domainName?.toLowerCase()}${config.tld}`,
        txHash: regTxHash,
        address: walletStore.walletAddress,
      })
      terminateProcess()
    }
  }

  return (
    <Container maxWidth="1200px">
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <SearchBoxContainer>
          {isConnected && !walletStore.isMetamaskAvailable && (
            <Box align={'end'} margin={{ bottom: '16px' }}>
              <Web3Button />
            </Box>
          )}
          <Box justify={'center'} align={'center'}>
            <Box pad="16px">
              {!isTelegramMode ? (
                <GradientText $size="34px">
                  <TypedText />
                  .country
                </GradientText>
              ) : (
                <GradientText $size="20px">
                  Register your new domain
                </GradientText>
              )}
            </Box>
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
                nameExpired={searchResult.nameExpired}
                isOwner={searchResult.isOwner}
                price={freeRentKey ? '0' : searchResult.price.formatted}
                available={searchResult.isAvailable}
                error={searchResult.error}
              />
              <div>{!searchResult.nameExpired.isExpired}</div>
              {searchResult.isAvailable &&
                !searchResult.nameExpired.isInGracePeriod && (
                  <Button
                    disabled={!validation.valid}
                    onClick={handleRentDomain}
                  >
                    Register
                  </Button>
                )}
              {searchResult.isAvailable &&
                searchResult.nameExpired.isExpired &&
                searchResult.nameExpired.isInGracePeriod &&
                searchResult.isOwner && (
                  // <DomainRecordRenewal searchResult={searchResult} />
                  <Button
                    disabled={!validation.valid}
                    onClick={handleRenewDomain}
                  >
                    Renew Domain
                  </Button>
                )}
              {!walletStore.isConnected &&
                searchResult.nameExpired.isExpired &&
                searchResult.nameExpired.isInGracePeriod && (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FlexRow style={{ alignContent: 'center' }}>
                      {walletStore.isMetamaskAvailable && <MetamaskWidget />}
                      <Web3Button />
                    </FlexRow>
                  </div>
                )}
              {!searchResult.isAvailable &&
                validation.valid &&
                !searchResult.nameExpired.isInGracePeriod && (
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
              {processStatus.type === ProcessStatusTypes.IDLE &&
                !inputValue && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      as="a"
                      href="https://harmony.one/buy"
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginRight: '10px' }}
                    >
                      Buy ONE
                    </Button>
                    <Button
                      as="a"
                      href="https://harmony.one/1"
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: '10px' }}
                    >
                      Learn More
                    </Button>
                  </div>
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
      {!isMinimalRender && !isTelegramMode && (
        <PageCurationSection>
          {PAGE_CURATION_LIST.map((page, index) => (
            <PageCuration
              url={page.url}
              img={page.img}
              icon={page.icon}
              key={index}
            />
          ))}
        </PageCurationSection>
      )}
    </Container>
  )
})

export default HomeSearchPage
