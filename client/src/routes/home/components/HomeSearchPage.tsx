import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { observer } from 'mobx-react-lite'
import BN from 'bn.js'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Web3 from "web3";
import {Box} from "grommet";

import { HomeSearchResultItem } from './HomeSearchResultItem'
import { useStores } from '../../../stores'
import config from '../../../../config'

import { Button, LinkWrarpper } from '../../../components/Controls'
import { BaseText } from '../../../components/Text'
import { FlexRow, FlexColumn } from '../../../components/Layout'
import { DomainPrice, DomainRecord, relayApi } from '../../../api'
import { nameUtils } from '../../../api/utils'
import { parseTweetId } from '../../../utils/parseTweetId'
import { Container } from '../Home.styles'
import { cutString } from '../../../utils/string'
import ProcessStatus, { ProcessStatusProps, statusTypes } from '../../../components/process-status/ProcessStatus'
import { buildTxUri } from '../../../utils/explorer'
import {useAccount} from "wagmi";
import {Web3Button, useWeb3Modal} from "@web3modal/react";

const SearchBoxContainer = styled.div`
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

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(1), ms))
}

const validateDomainName = (domainName: string) => {

  if (nameUtils.isReservedName(domainName.toLowerCase())) {
    return {
      valid: false,
      error: 'This domain name is reserved for special purpose',
    }
  }

  if (!nameUtils.isValidName(domainName.toLowerCase())) {
    return {
      valid: false,
      error: 'Domains can use a mix of letters and numbers',
    }
  }

  return {
    valid: true,
    error: '',
  }
}

interface SearchResult {
  domainName: string
  domainRecord: DomainRecord
  price: DomainPrice
  isAvailable: boolean
}

export const HomeSearchPage: React.FC = observer(() => {
  const { isConnected, address, connector } = useAccount()
  const { open, close } = useWeb3Modal()
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get('domain') || '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<ProcessStatusProps>({ type: statusTypes.INFO, render: '' })
  const [validation, setValidation] = useState({ valid: true, error: '' })

  const [web2Error, setWeb2Error] = useState(false)
  const [secret] = useState<string>(Math.random().toString(26).slice(2))
  const [regTxHash, setRegTxHash] = useState<string>('')
  const [web2Acquired, setWeb2Acquired] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const { rootStore, ratesStore, walletStore } = useStores()

  const navigate = useNavigate()

  const updateSearch = (domainName: string) => {
    setSearchResult(null)
    const result = validateDomainName(domainName.toLowerCase())
    setValidation(result)

    if (result.valid) {
      loadDomainRecord(domainName)
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
      navigate(`new/${searchResult.domainName}`)
    }
  }, [web2Acquired])

  useEffect(() => {
    const connectWallet = async () => {
      const provider = await connector!.getProvider()
      walletStore.setProvider(provider, address)
      handleRentDomain()
    }
    if(!walletStore.isMetamaskAvailable) {
      if(isConnected) {
        connectWallet()
      }
    }
  }, [isConnected])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    updateSearch(event.target.value)
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

      setStatus({
        type: statusTypes.INFO,
        render: ''
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

      setLoading(false)
    }, 500)
  }, [rootStore.d1dcClient])

  const claimWeb2DomainWrapper = async () => {
    setLoading(true)
    try {
      await claimWeb2Domain(regTxHash)
      await sleep(1500)
      setStatus({
        type: statusTypes.SUCCESS,
        render: 'Web2 domain acquire'
      })
      terminateProcess()
      setWeb2Acquired(true)
    } catch (ex) {
      setWeb2Error(true)
      setStatus({
        type: statusTypes.ERROR,
        render: 'Unable to acquire web2 domain'
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

    console.log('### searchResult', searchResult)

    const { isAvailable } = await relayApi().checkDomain({
      sld: searchResult.domainName,
    })

    console.log('### isAvailable', isAvailable)

    if (!isAvailable) {
      return toast.error('This domain name is already registered')
    }

    const _available = await rootStore.d1dcClient.checkAvailable({
      name: searchResult.domainName,
    })
    if (!_available) {
      return toast.error('This domain name is already registered')
    }

    setStatus({
      render: 'Processing transaction'
    })

    if (!searchResult.domainName) {
      return toast.error('Invalid domain')
    }
    if (!nameUtils.isValidName(searchResult.domainName)) {
      return toast.error('Domain must be alphanumerical characters')
    }

    setStatus({
      type: statusTypes.INFO,
      render: ''
    })
    setLoading(true)

    try {
      if(walletStore.isMetamaskAvailable) {
        if (!walletStore.isConnected) {
          await walletStore.connect()
        }
      } else { // Wallet Connect
        if(!isConnected) {
          open()
          return
        } else {
          setStatus({
            type: statusTypes.INFO,
            render: 'Confirm with connected wallet'
          })
        }
      }
    } catch (e) {
      console.log('Connect error:', e)
      return
    }

    const commitResult = await rootStore.d1dcClient.commit({
      name: searchResult.domainName.toLowerCase(),
      secret,
      onFailed: (e) => {
        console.log('Commit result failed:', e)
        setStatus({
          type: statusTypes.ERROR,
          render: 'Failed to reserve the domain'
        })
        terminateProcess(3000)
        return
      },
      onSuccess: (tx) => {
        console.log('Commit result success:', tx)
        const { transactionHash } = tx

        setStatus({
          type: statusTypes.INFO,
          render: <FlexRow>
            <BaseText style={{ marginRight: 8 }}>
              Reserved {`${searchResult.domainName}${config.tld}`}
            </BaseText>
            (
            <LinkWrarpper
              target="_blank"
              type="text"
              href={buildTxUri(transactionHash)}
            >
              <BaseText>{cutString(transactionHash)}</BaseText>
            </LinkWrarpper>
            )
          </FlexRow>
        })
      },
    })
    console.log('Commit result:', commitResult)
    if (!commitResult) {
      return
    }
    console.log('waiting for 5 seconds...')
    await sleep(5000)

    setStatus({
      type: statusTypes.INFO,
      render: 'Purchasing Domain',
    })

    const tx = await rootStore.d1dcClient.rent({
      name: searchResult.domainName,
      secret,
      url: tweetId.toString(),
      amount: new BN(searchResult.price.amount).toString(),
      onSuccess: (tx: any) => {
        const { transactionHash } = tx
        setStatus({
          type: statusTypes.INFO,
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>
                Registered {`${searchResult.domainName}${config.tld}`}
              </BaseText>
            </FlexRow>
          )
        })
      },
      onFailed: () => {
        setStatus({
          type: statusTypes.ERROR,
          render: 'Failed to purchase'
        })
        terminateProcess(3000)
      },
    })
    console.log('RRENT', tx)
    if (!tx) {
      return
    }
    const txHash = tx.transactionHash
    setRegTxHash(txHash)

    try {
      await claimWeb2Domain(txHash)
      await sleep(1500)
      setStatus({
        type: statusTypes.SUCCESS,
        render: 'Web2 domain acquire'
      })
      terminateProcess()
      setWeb2Acquired(true)
    } catch (ex) {
      console.log('claimWeb2Domain error:', ex)
      setWeb2Error(true)
      setStatus({
        type: statusTypes.ERROR,
        render: 'Unable to acquire web2 domain'
      })
      terminateProcess()
    }
  }

  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <SearchBoxContainer>
          {(isConnected && !walletStore.isMetamaskAvailable) &&
            <Box align={'end'} margin={{ bottom: '16px' }}>
              <Web3Button />
            </Box>
          }
          <Box justify={'center'} align={'center'} margin={{ bottom: '24px' }}>
            <Box width={'14em'} flex={{ grow: 0 }}>
              <img
                style={{ objectFit: 'cover', width: '100%' }}
                src="/images/countryLogoNew.png"
                alt=".country"
              />
            </Box>
            <InputContainer
              valid={
                validation.valid &&
                (searchResult ? searchResult.isAvailable : true)
              }
              style={{ flexGrow: 0 }}
            >
              <StyledInput
                placeholder="Register your .country domain"
                value={inputValue}
                onChange={handleSearchChange}
                autoFocus
              />
            </InputContainer>
          </Box>

          {!validation.valid && <BaseText>Invalid domain name</BaseText>}
          {!validation.valid && <BaseText>{validation.error}</BaseText>}
          {loading && <ProcessStatus { ...status } />}
          {validation.valid &&
            !loading &&
            searchResult &&
            !web2Acquired &&
            !web2Error && (
              <>
                <HomeSearchResultItem
                  name={searchResult.domainName}
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
                  style={{ marginTop: '1em' }}
                  onClick={handleRentDomain}
                >
                  Register
                </Button>
              </>
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
