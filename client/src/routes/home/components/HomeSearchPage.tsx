import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { observer } from 'mobx-react-lite'
import BN from 'bn.js'
import { useNavigate, useSearchParams } from 'react-router-dom'

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
  console.log('isValidDomain', domainName)

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
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState(searchParams.get('domain') || '')
  const [loading, setLoading] = useState(false)
  // const [price, setPrice] = useState<DomainPrice | undefined>()
  const [status, setStatus] = useState<ProcessStatusProps>({ type: statusTypes.INFO, render: '' })
  // const [isValid, setIsValid] = useState(true)
  const [validation, setValidation] = useState({ valid: true, error: '' })
  // const [record, setRecord] = useState<DomainRecord | undefined>()

  // const [recordName, setRecordName] = useState('')

  const [web2Error, setWeb2Error] = useState(false)
  // const toastId = useRef(null)
  const [secret] = useState<string>(Math.random().toString(26).slice(2))
  const [regTxHash, setRegTxHash] = useState<string>('')
  const [web2Acquired, setWeb2Acquired] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const { rootStore, ratesStore, walletStore } = useStores()

  const navigate = useNavigate()
  const client = rootStore.d1dcClient

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    updateSearch(event.target.value)
  }

  const terminateProcess = async () => {
    await sleep(5000)
    setLoading(false)
  }
  
  const loadDomainRecord = useMemo(() => {
    return debounce(async (_domainName) => {
      if (!client || !_domainName) {
        return
      }

      setLoading(true)

      const [record, price, relayCheckDomain, isAvailable2] = await Promise.all(
        [
          client.getRecord({ name: _domainName }),
          client.getPrice({ name: _domainName }),
          relayApi().checkDomain({
            sld: _domainName,
          }),
          client.checkAvailable({
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

      terminateProcess()
    }, 500)
  }, [client])

  const claimWeb2DomainWrapper = async () => {
    setLoading(true)
    try {
      await claimWeb2Domain(regTxHash)
      setWeb2Error(false)
      setWeb2Acquired(true)
    } catch (ex) {
      setWeb2Error(true)
      toast.error('Unable to acquire web2 domain')
      console.error(ex)
    } finally {
      terminateProcess()
      // setLoading(false)
    }
  }

  const claimWeb2Domain = async (txHash: string) => {
    const { success, responseText } = await relayApi().purchaseDomain({
      domain: `${searchResult.domainName.toLowerCase()}${config.tld}`,
      txHash,
      address: walletStore.walletAddress,
    })
    if (success) {
      setWeb2Acquired(true)
    } else {
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

    const _available = await client.checkAvailable({
      name: searchResult.domainName,
    })
    if (!_available) {
      return toast.error('This domain name is already registered')
    }

    setStatus({
      render: 'Processing transaction'
    })

    // toastId.current = toast.loading('Processing transaction')

    if (!searchResult.domainName) {
      return toast.error('Invalid domain')
    }
    if (!nameUtils.isValidName(searchResult.domainName)) {
      return toast.error('Domain must be alphanumerical characters')
    }

    setLoading(true)

    try {
      if (!walletStore.isConnected) {
        await walletStore.connect()
      }
    } catch (e) {
      console.log('Error', e)
      return
    }

    await client.commit({
      name: searchResult.domainName.toLowerCase(),
      secret,
      onFailed: () => setStatus({
        type: statusTypes.ERROR,
        render: 'Failed to commit purchase'
      }),
      // toast.error('Failed to commit purchase'),
      onSuccess: (tx) => {
        console.log(tx)
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
              href={client.getExplorerUri(transactionHash)}
            >
              <BaseText>{cutString(transactionHash)}</BaseText>
            </LinkWrarpper>
            )
          </FlexRow>
        })
      },
    })

    console.log('waiting for 5 seconds...')
    await sleep(5000)
    
    setStatus({
      type: statusTypes.INFO,
      render: 'Purchasing Domain',
    })
    
    const tx = await client.rent({
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
        terminateProcess()
      },
    })

    const txHash = tx.transactionHash
    setRegTxHash(txHash)

    try {
      await claimWeb2Domain(txHash)
      await sleep(1500)
      setStatus({
        type: statusTypes.SUCCESS,
        render: 'Domain registered'
      })
      terminateProcess()
      // setLoading(false)
      setWeb2Acquired(true)
    } catch (ex) {
      console.log('claimWeb2Domain error:', ex)
      setWeb2Error(true)
      setStatus({
        type: statusTypes.ERROR,
        render: 'Failed to claim the domain'
      })
    } finally {
      terminateProcess()

    }
  }

  return (
    <Container>
      <FlexRow style={{ alignItems: 'baseline', marginTop: 25, width: '100%' }}>
        <SearchBoxContainer>
          <FlexColumn
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              marginBottom: '24px',
            }}
          >
            <div style={{ width: '14em', flexGrow: 0 }}>
              <img
                style={{ objectFit: 'cover', width: '100%' }}
                src="/images/countryLogo.png"
                alt=".country"
              />
            </div>
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
          </FlexColumn>

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
