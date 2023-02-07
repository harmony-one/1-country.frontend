import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import { Button } from './Controls'
import { SearchResultItem } from './SearchResultItem'

const Container = styled.div`
  width: 100%;
`

const InputContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  border: 2px solid #CFCFCF;
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-bottom: 24px;
`

const StyledInput = styled.input`
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

export const SearchBlock = ({ client }) => {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState()
  const [price, setPrice] = useState()
  const [record, setRecord] = useState()
  const [recordName, setRecordName] = useState('')
  const [parameters, setParameters] = useState({
    rentalPeriod: 0,
    priceMultiplier: 0,
  })

  useEffect(() => {
    if (!client) {
      return
    }
    client.getParameters().then((p) => setParameters(p))
  }, [client])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    handleSearch(event.target.value)
  }

  const handleSearch = useMemo(() => {
    return debounce((search) => {
      if (!client || !search) {
        return
      }

      setLoading(true)

      client.getRecord({ name: search }).then((r) => {
        setRecord(r)
        setLoading(false)
      }).catch(ex => {
        console.log('### ex', ex)
      })
      client.getPrice({ name: search }).then((p) => {
        setPrice(p)
      })

      setRecordName(search)
    }, 500)
  }, [client])

  return (
    <Container>
      <InputContainer>
        {/* <AiOutlineSearch size='24px' style={{ margin: '0px 8px 0px 12px' }} /> */}
        <StyledInput placeholder='harmony.1' value={search} onChange={handleSearchChange} />
        <Button style={{ marginLeft: 'auto' }} onClick={handleSearchChange}>Pay</Button>
      </InputContainer>
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

      {loading && (
        <div>Loading...</div>
      )}

      {!loading && record && price &&
        <SearchResultItem
          name={recordName}
          price={price.formatted}
          available={!record.renter}
          period={parameters.rentalPeriod}
        />}
    </Container>
  )
}
