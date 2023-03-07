import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { observer } from 'mobx-react-lite'
import BN from 'bn.js'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box } from 'grommet/components/Box'

import { HomeSearchResultItem } from './HomeSearchResultItem'
import { useStores } from '../../../stores'
import config from '../../../../config'

import { Button, LinkWrarpper } from '../../../components/Controls'
import { BaseText, GradientText } from '../../../components/Text'
import { FlexRow } from '../../../components/Layout'
import { DomainPrice, DomainRecord, relayApi } from '../../../api'
import { nameUtils, validateDomainName } from '../../../api/utils'
import { parseTweetId } from '../../../utils/parseTweetId'
import { Container } from '../Home.styles'
import { cutString } from '../../../utils/string'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../../components/process-status/ProcessStatus'
import { buildTxUri } from '../../../utils/explorer'
import {useAccount, useDisconnect} from 'wagmi'
import { useWeb3Modal, Web3Button } from '@web3modal/react'
import { TypedText } from './Typed'
import { sleep } from '../../../utils/sleep'
import { SearchInput } from '../../../components/search-input/SearchInput'
import { FormSearch } from 'grommet-icons/icons/FormSearch'

const SearchBoxContainer = styled(Box)`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`

export const InputContainer = styled.div<{ valid?: boolean }>`
  position: relative;
  border-radius: 5px;
  box-sizing: border-box;
  border: 2px solid ${(props) => (props.valid ? '#758796' : '#ff8c8c')};
  display: flex;
  align-items: center;
  overflow: hidden;
  width: 100%;
`

export const StyledInput = styled.input`
  border: none;
  font-family: 'NunitoRegular', system-ui;
  font-size: 1rem;
  box-sizing: border-box;
  padding: 0.4em;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    font-size: 0.7em;
    text-align: center;
  }

  @media (min-width: 640px) {
    &::placeholder {
      font-size: 1em;
    }
  }
`

const { tweetId } = parseTweetId(
  'https://twitter.com/harmonyprotocol/status/1621679626610425857?s=20&t=SabcyoqiOYxnokTn5fEacg'
)

interface SearchResult {
  domainName: string
  domainRecord: DomainRecord
  price: DomainPrice
  isAvailable: boolean
}

export const HomeSearchPage: React.FC = observer(() => {
  const { isConnected, address, connector, status } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, close, isOpen } = useWeb3Modal()
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get('domain') || '')
  const [loading, setLoading] = useState(false)
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

  const navigate = useNavigate()

  useEffect(() => {
    if(status === 'connecting') {
      if(!isOpen && !walletStore.isMetamaskAvailable) { // User declined connect with Wallet Connect
        disconnect()
        setProcessStatus({
          type: ProcessStatusTypes.IDLE,
          render: '',
        })
        terminateProcess(0)
      }
    }
  }, [status, isOpen])

  const updateSearch = (domainName: string) => {
    setSearchResult(null)
    if (domainName) {
      const result = validateDomainName(domainName)
      setValidation(result)

      if (result.valid) {
        loadDomainRecord(domainName)
      }
    } else {
      setValidation({ valid: true, error: '' })
    }
  }

  // setup form from query string
  useEffect(() => {
    if (inputValue) {
      updateSearch(inputValue)
    }
  }, [])

  useEffect(() => {
    if (web2Acquired) {
      window.location.href = `${config.hostname}/new?domain=${searchResult.domainName}`
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
      }
    }
  }, [isConnected])

  const handleSearchChange = (value: string) => {
    setInputValue(value)
    updateSearch(value)
  }

  const terminateProcess = async (timer: number = 5000) => {
    await sleep(timer)
    setLoading(false)
  }

  const loadDomainRecord = useMemo(() => {
    return debounce(async (_domainName) => {
      if (!_domainName) {
        return
      }

      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: '',
      })
      setLoading(true) //will show three dots

      const [record, price, relayCheckDomain, isAvailable2] = await Promise.all(
        [
          rootStore.d1dcClient.getRecord({ name: _domainName }),
          rootStore.d1dcClient.getPrice({ name: _domainName }),
          relayApi().checkDomain({
            sld: _domainName,
          }),
          rootStore.d1dcClient.checkAvailable({
            name: _domainName,
          }),
        ]
      )

      setSearchResult({
        domainName: _domainName,
        domainRecord: record,
        price: price,
        isAvailable: relayCheckDomain.isAvailable && isAvailable2,
      })

      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
      setLoading(false)
    }, 500)
  }, [rootStore.d1dcClient])

  const claimWeb2DomainWrapper = async () => {
    setLoading(true)
    try {
      await claimWeb2Domain(regTxHash)
      await sleep(1500)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Web2 domain acquire</BaseText>,
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
    const { success, responseText } = await relayApi().purchaseDomain({
      domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
      txHash,
      address: walletStore.walletAddress,
    })
    if (!success) {
      console.log(`failure reason: ${responseText}`)
      throw new Error(`Unable to acquire web2 domain. Reason: ${responseText}`)
    }
  }

  const handleRentDomain = async () => {
    if (!searchResult.domainRecord || !validation.valid) {
      return false
    }

    setLoading(true)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Check domain</BaseText>,
    })

    console.log('### searchResult', searchResult)

    const { isAvailable } = await relayApi().checkDomain({
      sld: searchResult.domainName,
    })

    if (!isAvailable) {
      setValidation({
        valid: false,
        error: 'This domain name is already registered',
      })
      setLoading(false)
      return
    }

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

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
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
          <LinkWrarpper
            target="_blank"
            type="text"
            href={buildTxUri(commitResult.txReceipt.transactionHash)}
          >
            <BaseText>
              {cutString(commitResult.txReceipt.transactionHash)}
            </BaseText>
          </LinkWrarpper>
          )
        </FlexRow>
      ),
    })

    console.log('Commit result:', commitResult)
    console.log('waiting for 5 seconds...')
    await sleep(5000)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })

    const rentResult = await rootStore.d1dcClient.rent({
      name: searchResult.domainName.toLowerCase(),
      secret,
      url: tweetId.toString(),
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

    try {
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
        render: <BaseText>Unable to acquire web2 domain. Try Again.</BaseText>,
      })
      terminateProcess()
    }
  }

  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <SearchBoxContainer gap="24px">
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
                value={inputValue}
                placeholder={'Type the domain you want'}
                icon={<FormSearch />}
                onSearch={handleSearchChange}
              />
            </Box>
          </Box>

          {!validation.valid && <BaseText>{validation.error}</BaseText>}
          {processStatus.type !== ProcessStatusTypes.IDLE && (
            <ProcessStatus status={processStatus} />
          )}
          {validation.valid &&
            !loading &&
            searchResult &&
            !web2Acquired &&
            !web2Error && (
              <Box gap="12px" align="center">
                <HomeSearchResultItem
                  name={searchResult.domainName.toLowerCase()}
                  rateONE={ratesStore.ONE_USD}
                  price={searchResult.price.formatted}
                  available={searchResult.isAvailable}
                />
                {/* <TermsCheckbox
            checked={isTermsAccepted}
            onChange={setIsTermsAccepted}
          /> */}
                <Button
                  disabled={!validation.valid || !searchResult.isAvailable}
                  onClick={handleRentDomain}
                >
                  Register
                </Button>
              </Box>
            )}
          {web2Error && (
            <Button onClick={claimWeb2DomainWrapper} disabled={loading}>
              TRY AGAIN
            </Button>
          )}
        </SearchBoxContainer>
      </FlexRow>
    </Container>
  )
})
