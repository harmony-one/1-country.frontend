import React from 'react'
import styled from 'styled-components'
import humanizeDuration from 'humanize-duration'
import { Box } from 'grommet'
import { BaseText } from '../../../components/Text'

const Container = styled.div`
  position: relative;
`

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

const calcDomainUSDPrice = (domainName) => {
  const len = domainName.length

  if (len <= 3) {
    return 100
  }

  if (len <= 6) {
    return 10
  }

  if (len <= 9) {
    return 1
  }

  return 0.1
}

const calDomainOnePrice = (domainName, oneUsdRate = 0.02588853) => {
  const priceUsd = calcDomainUSDPrice(domainName)

  return priceUsd / oneUsdRate
}

const formatNumber = (num) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return twoDecimalsFormatter.format(Number(num))
}

export const DomainName = styled(BaseText)`
  font-size: 1.2rem;
  font-weight: bold;
`

export const SearchResultItem = ({
  name,
  available = false,
  period,
  rateONE,
}) => {
  const priceUsd = calcDomainUSDPrice(name)
  const priceOne = calDomainOnePrice(name, rateONE)

  return (
    <Container>
      <div>{available ? '' : 'Domain Name Unavailable'}</div>
      {available && (
        <Box gap="8px" direction="column">
          <DomainName>{name}.1.country</DomainName>
          <BaseText>
            {formatNumber(priceOne)} ONE = ${formatNumber(priceUsd)}.00 USD for{' '}
            {humanD(period)} (
            <a
              style={{ color: '#758796' }}
              href="https://harmony.one/1country-terms"
              target="_blank"
              rel="noreferrer"
            >
              terms
            </a>
            )
          </BaseText>
        </Box>
      )}
    </Container>
  )
}