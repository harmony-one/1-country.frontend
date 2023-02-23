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

const regx = /^[a-zA-Z0-9]{1,}((?!-)[a-zA-Z0-9]{0,}|-[a-zA-Z0-9]{1,})+$/
const { tweetId } = parseTweetId(
  'https://twitter.com/harmonyprotocol/status/1621679626610425857?s=20&t=SabcyoqiOYxnokTn5fEacg'
)

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(1), ms))
}

const isValidDomainName = (domainName: string) => {
  console.log('isValidDomain', domainName)
  return regx.test(domainName)
}

export const HomeSearchPage: React.FC = observer(() => {
  const [searchParams] = useSearchParams()
  const [domainName, setDomainName] = useState(searchParams.get('domain') || '')
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState<DomainPrice | undefined>()

  const [record, setRecord] = useState<DomainRecord | undefined>()
  const [isValid, setIsValid] = useState(true)
  const [recordName, setRecordName] = useState('')
  const [web2Error, setWeb2Error] = useState(false)
  const toastId = useRef(null)
  const [secret] = useState<string>(Math.random().toString(26).slice(2))
  const [regTxHash, setRegTxHash] = useState<string>('')
  const [web2Acquired, setWeb2Acquired] = useState(false)
  const { rootStore, ratesStore, walletStore } = useStores()

  const navigate = useNavigate()
  const client = rootStore.d1dcClient

  const updateSearch = (domainName: string) => {
    const _isValid = isValidDomainName(domainName.toLowerCase())
    setIsValid(_isValid)

    if (_isValid) {
      loadDomainRecord(domainName)
    }
  }

  // setup form from query string
  useEffect(() => {
    if (domainName) {
      updateSearch(domainName)
    }
  }, [])

  useEffect(() => {
    if (web2Acquired) {
      navigate(`new/${domainName}`)
    }
  }, [web2Acquired])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomainName(event.target.value)
    updateSearch(event.target.value)
  }

  const loadDomainRecord = useMemo(() => {
    return debounce((_domainName) => {
      if (!client || !_domainName) {
        return
      }

      setLoading(true)

      client
        .getRecord({ name: _domainName })
        .then((r) => {
          setRecord(r)
          setLoading(false)
        })
        .catch((ex) => {
          console.log('### ex', ex)
        })
      client.getPrice({ name: _domainName }).then((p) => {
        setPrice(p)
      })

      setRecordName(_domainName)
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
      setLoading(false)
    }
  }

  const claimWeb2Domain = async (txHash: string) => {
    const { success, responseText } = await relayApi().purchaseDomain({
      domain: `${domainName.toLowerCase()}${config.tld}`,
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
    if (!record || !isValid) {
      return false
    }

    if (
      domainName.length <= 2 &&
      nameUtils.SPECIAL_NAMES.includes(domainName.toLowerCase())
    ) {
      return toast.error('This domain name is reserved for special purpose')
    }

    const { isAvailable } = await relayApi().checkDomain({ sld: domainName })

    if (!isAvailable) {
      return toast.error('This domain name is reserved or registered')
    }

    toastId.current = toast.loading('Processing transaction')

    if (!domainName) {
      return toast.error('Invalid domain')
    }
    if (!nameUtils.isValidName(domainName)) {
      return toast.error(
        'Domain must be alphanumerical characters or hyphen (-)'
      )
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
      name: domainName.toLowerCase(),
      secret,
      onFailed: () => toast.error('Failed to commit purchase'),
      onSuccess: (tx) => {
        console.log(tx)
        const { transactionHash } = tx
        toast.update(toastId.current, {
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>
                Reserved {`${domainName}${config.tld}`}
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
          ),
          type: toast.TYPE.INFO,
        })
      },
    })

    console.log('waiting for 5 seconds...')
    await sleep(5000)
    toast.update(toastId.current, {
      render: 'Proceeding to purchase',
      type: toast.TYPE.INFO,
    })
    const tx = await client.rent({
      name: recordName,
      secret,
      url: tweetId.toString(),
      amount: new BN(price.amount).toString(),
      onSuccess: (tx: any) => {
        const { transactionHash } = tx
        toast.update(toastId.current, {
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>
                Registered {`${recordName}${config.tld}`}
              </BaseText>
            </FlexRow>
          ),
          type: toast.TYPE.SUCCESS,
        })
      },
      onFailed: () => {
        setLoading(false)
        toast.update(toastId.current, {
          render: 'Failed to purchase',
          type: toast.TYPE.ERROR,
          isLoading: false,
          autoClose: 2000,
        })
      },
    })

    const txHash = tx.transactionHash
    setRegTxHash(txHash)

    try {
      await claimWeb2Domain(txHash)
      await sleep(1500)
      toast.update(toastId.current, {
        render: 'Domain registered',
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        autoClose: 2000,
      })
      setLoading(false)
      setWeb2Acquired(true)
    } catch (ex) {
      console.log('claimWeb2Domain error:', ex)
      setWeb2Error(true)
      toast.update(toastId.current, {
        render: 'Failed to claim the domain',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  const isAvailable = record ? !record.renter : true
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
              valid={isValid && isAvailable}
              style={{ flexGrow: 0 }}
            >
              <StyledInput
                placeholder="Register your .country domain"
                value={domainName}
                onChange={handleSearchChange}
                autoFocus
              />
            </InputContainer>
          </FlexColumn>

          {!isValid && <BaseText>Invalid domain name</BaseText>}
          {!isValid && (
            <BaseText>
              Domains can use a mix of letters and numbers
            </BaseText>
          )}
          {loading && <div>Loading...</div>}
          {isValid &&
            !loading &&
            record &&
            price &&
            !web2Acquired &&
            !web2Error && (
              <>
                <HomeSearchResultItem
                  name={recordName}
                  rateONE={ratesStore.ONE_USD}
                  price={price.formatted}
                  available={isAvailable}
                />
                {/* <TermsCheckbox
            checked={isTermsAccepted}
            onChange={setIsTermsAccepted}
          /> */}
                <Button
                  disabled={!isValid || !isAvailable}
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
