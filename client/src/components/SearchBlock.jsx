import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AiOutlineSearch } from 'react-icons/all'
import { Button } from './Controls'
import { SearchResultItem } from './SearchResultItem'

const Container = styled.div`
  width: 100%;
`

const InputContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  border: 1px solid #808080;
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-bottom: 24px;
`

const StyledInput = styled.input`
  border: none;
  font-family: 'DecimaMono', system-ui;
  font-size: 1rem;
  margin: 0;
  padding: 0;
  width: 100%;
  
  &:focus {
    outline: none;
  }
`

export const SearchBlock = ({ client }) => {
  const [search, setSearch] = useState('')
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
  }

  const handleSearch = () => {
    if (!client) {
      return
    }

    setRecordName((search))

    client.getRecord({ name: search }).then((r) => setRecord(r)).catch(ex => {
      console.log('### ex', ex)
    })
    client.getPrice({ name: search }).then((p) => {
      setPrice(p)
    })
  }

  console.log('### parameters', parameters)

  return (
    <Container>
      <InputContainer>
        <AiOutlineSearch size='24px' style={{ margin: '0px 8px 0px 12px' }} />
        <StyledInput placeholder='Search addresses' value={search} onChange={handleSearchChange} />
        <Button style={{ marginLeft: 'auto' }} onClick={handleSearch}>Search</Button>
      </InputContainer>

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

      {record && price &&
        <SearchResultItem
          name={recordName}
          price={price.formatted}
          available={!record.renter}
          period={parameters.rentalPeriod}
        />}
    </Container>
  )
}
