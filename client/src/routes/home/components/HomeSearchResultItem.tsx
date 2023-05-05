import React from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { BaseText } from '../../../components/Text'
import {
  calcDomainUSDPrice,
  formatONEAmount,
  formatUSDAmount,
} from '../../../utils/domain'
import { DomainRecord } from '../../../api'

const Container = styled.div`
  position: relative;
`

export const DomainName = styled(BaseText)`
  font-size: 1.2rem;
  font-weight: bold;
`

interface Props {
  name: string
  available?: boolean
  price: string
  rateONE: number
  domainRecord: DomainRecord
  error: string
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const HomeSearchResultItem: React.FC<Props> = ({
  name,
  available = false,
  price,
  domainRecord,
  rateONE,
  error,
}) => {
  const priceUsd = calcDomainUSDPrice(Number(price), rateONE)
  const priceOne = price

  const showExpirationTime = domainRecord && domainRecord.expirationTime > 0

  return (
    <Container>
      {!available && (
        <Box>
          <div>{error ? error : 'Domain Name Unavailable'}</div>
          {showExpirationTime && (
            <BaseText>
              Expires {dateFormat.format(domainRecord.expirationTime)}
            </BaseText>
          )}
        </Box>
      )}

      {available && (
        <Box gap="8px" direction="column">
          <DomainName>{name}.country</DomainName>
          <BaseText>
            {formatONEAmount(priceOne)} ONE = ${formatUSDAmount(priceUsd)} USD
            for 3 months
          </BaseText>
          <a
            style={{
              color: '#758796',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
            href="https://harmonyone.notion.site/harmonyone/Terms-Conditions-6096dbaf43f6402fb4719efaace47a5e"
            target="_blank"
            rel="noreferrer"
          >
            By registering, you agree to the <u>Terms of Service</u>.
          </a>
        </Box>
      )}
    </Container>
  )
}
