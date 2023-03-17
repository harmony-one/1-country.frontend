import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { observer } from 'mobx-react-lite'
import BN from 'bn.js'
import { useSearchParams } from 'react-router-dom'
import { Box } from 'grommet/components/Box'
import { Text } from 'grommet/components/Text'

import { HomeSearchResultItem } from './HomeSearchResultItem'
import { useStores } from '../../../stores'
import config from '../../../../config'

import { Button, LinkWrapper } from '../../../components/Controls'
import { BaseText, GradientText } from '../../../components/Text'
import { FlexRow } from '../../../components/Layout'
import { DomainPrice, DomainRecord } from '../../../api'
import { nameUtils, validateDomainName } from '../../../api/utils'
import { Container } from '../Home.styles'
import { cutString } from '../../../utils/string'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../../components/process-status/ProcessStatus'
import { buildTxUri } from '../../../utils/explorer'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal, Web3Button } from '@web3modal/react'
import { TypedText } from './Typed'
import { sleep } from '../../../utils/sleep'
import { SearchInput } from '../../../components/search-input/SearchInput'
import { FormSearch } from 'grommet-icons/icons/FormSearch'
import { relayApi } from '../../../api/relayApi'
import qs from 'qs'
import { mainApi } from '../../../api/mainApi'

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
}

const HomeSearchPage: React.FC = observer(() => {
  const { isConnected, address, connector, status } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, close, isOpen } = useWeb3Modal()
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get('domain') || '')
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
  const { rootStore, ratesStore, walletStore } = useStores()

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
      // navigate(`new/${searchResult.domainName}`)
    }
  }, [web2Acquired])

  useEffect(() => {
    const connectWallet = async () => {
      const provider = await connector!.getProvider()
      walletStore.setProvider(provider, address)
      handleRentDomain()
    }

    if (!walletStore.isMetamaskAvailable) {
      if (isConnected) {
        connectWallet()
      } else { // Wallet Connect disconnected, drop to initial state
        if(processStatus.type === ProcessStatusTypes.PROGRESS) {
          terminateProcess(1)
        }
      }
    }
  }, [isConnected])

  const handleSearchChange = (value: string) => {
    setInputValue(value)
    updateSearch(value)

    if (!value && processStatus.type === ProcessStatusTypes.ERROR) {
      setProcessStatus({ type: ProcessStatusTypes.IDLE, render: '' })
    }
  }

  const terminateProcess = async (timer: number = 5000) => {
    await sleep(timer)
    setLoading(false)
  }

  const loadDomainRecord = async (_domainName: string) => {
    const [record, price, relayCheckDomain, isAvailable2] = await Promise.all([
      rootStore.d1dcClient.getRecord({ name: _domainName }),
      rootStore.d1dcClient.getPrice({ name: _domainName }),
      _domainName.length > 2
        ? relayApi().checkDomain({
            sld: _domainName,
          })
        : {
            isAvailable: true,
          },
      rootStore.d1dcClient.checkAvailable({
        name: _domainName,
      }),
    ])

    return {
      domainName: _domainName,
      domainRecord: record,
      price: price,
      isAvailable: relayCheckDomain.isAvailable && isAvailable2,
    }
  }

  const claimWeb2DomainWrapper = async () => {
    setLoading(true)
    try {
      await claimWeb2Domain(regTxHash)
      await sleep(1500)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Web2 domain acquired</BaseText>,
      })
      terminateProcess()
      setWeb2Acquired(true)
    } catch (ex) {
      setWeb2Error(true)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Unable to acquire web2 domain</BaseText>,
      })
      console.error(ex)
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
        throw new Error(
          `Unable to acquire web2 domain. Reason: ${responseText}`
        )
      }
    } catch (ex) {
      clearTimeout(timerId)
      console.log('### ex', ex)
      throw new Error(`Unable to acquire web2 domain`)
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

    // const { isAvailable } = await relayApi().checkDomain({
    //   sld: searchResult.domainName,
    // })
    //
    // if (!isAvailable) {
    //   setValidation({
    //     valid: false,
    //     error: 'This domain name is already registered',
    //   })
    //   setLoading(false)
    //   return
    // }

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
      console.log('Connect error:', e)
      return
    }

    try {
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
        console.log('Commit result failed:', commitResult.error)
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>{commitResult.error.message}</BaseText>,
        })
        terminateProcess(1500)
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
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>{rentResult.error.message}</BaseText>,
        })
        terminateProcess(1500)
        return
      }

      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: (
          <FlexRow>
            <BaseText style={{ marginRight: 8 }}>
              Registered {`${searchResult.domainName}${config.tld}`} (3 min avg)
            </BaseText>
          </FlexRow>
        ),
      })

      const txHash = rentResult.txReceipt.transactionHash
      setRegTxHash(txHash)

      mainApi.createDomain({ domain: searchResult.domainName, txHash })

      await claimWeb2Domain(txHash)
      await sleep(1500)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Web2 domain acquire</BaseText>,
      })
      terminateProcess()
      setWeb2Acquired(true)
    } catch (ex) {
      console.log('claimWeb2Domain error:', ex)
      setWeb2Error(true)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Unable to acquire domain. Try Again.</BaseText>,
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
          <Box justify={'center'} align={'center'}>
            <Box pad="16px">
              <GradientText $size="34px">
                <TypedText />
                .country
              </GradientText>
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
                price={searchResult.price.formatted}
                available={searchResult.isAvailable}
              />
              <Button
                disabled={!validation.valid || !searchResult.isAvailable}
                onClick={handleRentDomain}
              >
                Register
              </Button>
            </Box>
          ) : (
            <Box margin={{ top: '16px' }}>
              {!validation.valid && (
                <Text size={'medium'} style={{ whiteSpace: 'pre-line' }}>{validation.error}</Text>
              )}
              {processStatus.type !== ProcessStatusTypes.IDLE && (
                <ProcessStatus status={processStatus} />
              )}
              {processStatus.type === ProcessStatusTypes.IDLE &&
                !inputValue && (
                  <Box align="center">
                    <Button
                      as="a"
                      href="https://harmony.one/1"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Learn More
                    </Button>
                  </Box>
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

export default HomeSearchPage
