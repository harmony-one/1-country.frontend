import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { observer } from 'mobx-react-lite'
import BN from 'bn.js'

import { SearchResultItem } from './SearchResultItem'
import { useStores } from '../../../stores'
import config from '../../../../config'

// @ts-ignore
import Logo from '../../../../assets/images/1countryLogo.jpg'
import { Button, LinkWrarpper } from '../../../components/Controls'
import { BaseText } from '../../../components/Text'
import { FlexRow, FlexColumn } from '../../../components/Layout'
import { useSearchParams } from 'react-router-dom'
import { DomainPrice, DomainRecord } from '../../../api'

const SearchBoxContainer = styled.div`
  width: 80%;
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
  margin: 0 8px 0 8px;
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

const isValidDomainName = (domainName: string) => {
  return regx.test(domainName)
}

export const SearchBlock = observer(() => {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('domain') || '')
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState<DomainPrice | undefined>()
  const [record, setRecord] = useState<DomainRecord | undefined>()
  const [isValid, setIsValid] = useState(true)
  const [recordName, setRecordName] = useState('')
  const toastId = useRef(null)

  const { rootStore, ratesStore, domainStore, walletStore } = useStores()

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
    if (search) {
      updateSearch(search)
    }
  }, [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    updateSearch(event.target.value)
  }

  const loadDomainRecord = useMemo(() => {
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

  const handlePay = async () => {
    if (!record || !isValid) {
      return false
    }

    setLoading(true)

    toastId.current = toast.loading('Processing transaction')

    try {
      if (!walletStore.isConnected) {
        await walletStore.connect()
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
      <FlexColumn
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          marginBottom: '24px',
          gap: '1.5em',
        }}
      >
        <div style={{ width: '4em', height: '4em', flexGrow: 0 }}>
          <img
            style={{ objectFit: 'cover', width: '100%' }}
            src={Logo}
            alt="1.country"
          />
        </div>
        <InputContainer valid={isValid && isAvailable} style={{ flexGrow: 0 }}>
          <StyledInput
            placeholder="Register your .country domain"
            value={search}
            onChange={handleSearchChange}
            autoFocus
          />
        </InputContainer>
      </FlexColumn>

      {!isValid && <BaseText>Invalid domain name</BaseText>}
      {!isValid && (
        <BaseText>
          Domain can use a mix of letters (English A-Z), numbers and dash
        </BaseText>
      )}
      {loading && <div>Loading...</div>}
      {isValid && !loading && record && price && (
        <>
          <SearchResultItem
            name={recordName}
            rateONE={ratesStore.ONE_USD}
            available={!record.renter}
            period={domainStore.d1cParams.rentalPeriod}
          />
          <Button
            disabled={!isValid || !isAvailable}
            style={{ marginTop: '1em' }}
            onClick={handlePay}
          >
            Register
          </Button>
        </>
      )}
    </SearchBoxContainer>
  )
})