import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { Button } from './Controls'
import { SearchResultItem } from './SearchResultItem'
import { BaseText } from './Text'
import { useStores } from '../stores'
import { observer } from 'mobx-react-lite'

const Container = styled.div`
  width: 100%;
`

export const InputContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  border: 2px solid ${(props) => (props.valid ? '#cfcfcf' : '#ff8c8c')};
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-bottom: 24px;
`

export const StyledInput = styled.input`
  border: none;
  font-family: 'DecimaMono', system-ui;
  font-size: 1rem;
  margin: 0 8px 0 12px;
  padding: 0;
  width: 100%;

  &:focus {
    outline: none;
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

  const handlePay = () => {
    if (!record || !isValid) {
      return false
    }
  }

  return (
    <Container>
      <InputContainer valid={isValid}>
        {/* <AiOutlineSearch size='24px' style={{ margin: '0px 8px 0px 12px' }} /> */}
        <StyledInput
          placeholder="harmony.1"
          value={search}
          valid={isValid}
          onChange={handleSearchChange}
        />
        <Button
          disabled={!isValid}
          style={{ marginLeft: 'auto' }}
          onClick={handlePay}
        >
          Pay
        </Button>
      </InputContainer>

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
        <SearchResultItem
          name={recordName}
          price={price.formatted}
          rateONE={ratesStore.ONE_USD}
          available={!record.renter}
          period={parameters.rentalPeriod}
        />
      )}
    </Container>
  )
})
