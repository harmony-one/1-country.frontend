import React from 'react'
import styled from 'styled-components'
import { Button } from './Controls'
import humanizeDuration from 'humanize-duration'
import { BaseText } from './Text'
import config from '../../config'

const Container = styled.div`
  position: relative;
  display: grid;
  align-items: center;
  padding-left: 12px;
  border-left: 2px solid;
  gap: 8px;

  @media(max-width: 780px){
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  @media(min-width: 780px){
    grid-template-columns: 1fr min-content 1fr 1fr;
    grid-template-rows: 50px;
  }
`

const Name = styled(BaseText)`
  font-size: 1.2rem;
  font-weight: bold;
`

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

export const SearchResultItem = ({ name, available = false, price, period }) => {
  const link = `https://${name}${config.tld}`
  const handleClickRent = () => {
    window.open(link)
  }

  return (
    <Container>
      <Name>{name}{config.tld}</Name>
      <div>{available ? 'Available' : 'Unavailable'}</div>
      {available && <div>{price} ONE for {humanD(period)}</div>}
      {available && <Button onClick={handleClickRent}>RENT</Button>}
    </Container>
  )
}
