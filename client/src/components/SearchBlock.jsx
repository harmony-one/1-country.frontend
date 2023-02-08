import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { observer } from 'mobx-react-lite'
import { useAccount } from 'wagmi'
import BN from 'bn.js'

import { SearchResultItem } from './SearchResultItem'
import { wagmiClient } from '../modules/wagmi/wagmiClient'
import { useStores } from '../stores'
import config from '../../config'

import Logo from '../../assets/images/1countryLogo.jpg'
import { Button, LinkWrarpper } from './Controls'
import { BaseText } from './Text'
import { FlexRow, FlexColumn } from './Layout'

const SearchBoxContainer = styled.div`
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
`

export const InputContainer = styled.div`
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
  margin: 0 8px 0 12px;
  padding: 0.4em;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder{
    font-size: 0.7em;
    text-align: center;
  }

  @media(min-width: 640px){
    &::placeholder{
      font-size: 1em;
    }

  }
`

const regx =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/

const isValidDomainName = (domainName) => {
  return regx.test(domainName + '.1.country')
}

export const SearchBlock = observer(({ client }) => {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState()
  const [price, setPrice] = useState()
  const [record, setRecord] = useState()
  const [isValid, setIsValid] = useState(true)
  const [recordName, setRecordName] = useState('')
  const [parameters, setParameters] = useState({
    rentalPeriod: 0,
    priceMultiplier: 0,
  })

  const { ratesStore } = useStores()

  useEffect(() => {
    if (!client) {
      return
    }
    client.getParameters().then((p) => setParameters(p))
  }, [client])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    const _isValid = isValidDomainName(event.target.value)
    setIsValid(_isValid)

    if (_isValid) {
      handleSearch(event.target.value)
    }
  }

  const handleSearch = useMemo(() => {
    return debounce((search) => {
      if (!client || !search) {
        return
      }

      setLoading(true)

      client
        .getRecord({ name: search })
        .then((r) => {
          setRecord(r)
          setLoading(false)
        })
        .catch((ex) => {
          console.log('### ex', ex)
        })
      client.getPrice({ name: search }).then((p) => {
        setPrice(p)
      })

      setRecordName(search)
    }, 500)
  }, [client])

  const { isConnected } = useAccount()

  const toastId = useRef(null)

  const handlePay = async () => {
    if (!record || !isValid) {
      return false
    }

    setLoading(true)

    toastId.current = toast.loading('Processing transaction')

    try {
      if (!isConnected) {
        await wagmiClient.connectors.connect()
      }
    } catch (e) {
      console.log('Error', e)
      return
    }

    console.log('### recordName', recordName)

    client.rent({
      name: recordName,
      url: '',
      telegram: '',
      phone: '',
      email: '',
      amount: new BN(price.amount).toString(),
      onSuccess: (tx) => {
        setLoading(false)
        const { transactionHash } = tx
        toast.update(toastId.current, {
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
              <LinkWrarpper
                target="_blank"
                href={client.getExplorerUri(transactionHash)}
              >
                <BaseText>View transaction</BaseText>
              </LinkWrarpper>
            </FlexRow>
          ),
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        })

        window.location.href = `https://${recordName}${config.tld}`
      },
      onFailed: () => {
        setLoading(false)
        toast.update(toastId.current, {
          render: 'Failed to purchase',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
      },
    })
  }

  const isAvailable = record ? !record.renter : true

  return (
    <SearchBoxContainer>
      <FlexColumn style={{ width: '100%', justifyContent: 'center', alignItems: 'center', alignContent: 'center', marginBottom: '24px', gap: '1.5em' }}>
        <div style={{ width: '4em', height: '4em', flexGrow: 0 }}>
          <img style={{ objectFit: 'cover', width: '100%' }} src={Logo} alt='1.country' />
        </div>
        <InputContainer valid={isValid && isAvailable} style={{ flexGrow: 0 }}>
          {/* <AiOutlineSearch size='24px' style={{ margin: '0px 8px 0px 12px' }} /> */}
          <StyledInput
            placeholder="Search for your .1 and .country domain name"
            value={search}
            valid={isValid}
            onChange={handleSearchChange}
          />
        </InputContainer>
      </FlexColumn>
      
      {!isValid && <BaseText>Invalid domain name</BaseText>}
      {/* <div>1 ONE = ($1.20 USD) for 3 months</div> */}
      {/* <SearchResultItem */}
      {/*  name='sergey' */}
      {/*  price={1} */}
      {/*  available */}
      {/*  period={86400000} */}
      {/* /> */}
      {/* <SearchResultItem */}
      {/*  name='jon' */}
      {/*  price={1} */}
      {/*  available={false} */}
      {/*  period={86400000} */}
      {/* /> */}
      {loading && <div>Loading...</div>}
      {isValid && !loading && record && price && (
        <>
          <SearchResultItem
            name={recordName}
            price={price.formatted}
            rateONE={ratesStore.ONE_USD}
            available={!record.renter}
            period={parameters.rentalPeriod}
          />
          <Button
            disabled={!isValid || !isAvailable}
            style={{ marginTop: '1em' }}
            onClick={handlePay}
          >
            Pay
          </Button>
        </>
      )}

    </SearchBoxContainer>
  )
})
