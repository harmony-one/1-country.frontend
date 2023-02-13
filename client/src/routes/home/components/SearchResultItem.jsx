import React from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { BaseText } from '../../../components/Text'

const Container = styled.div`
  position: relative;
`

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

  return 0.01
}

const calDomainOnePrice = (domainName, oneUsdRate = 0.02588853) => {
  const priceUsd = calcDomainUSDPrice(domainName)

  return priceUsd / oneUsdRate
}

const formatONEAmount = (num) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 2 : 0,
  })

  return twoDecimalsFormatter.format(Number(num))
}

const formatUSDAmount = (num) => {
  const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return twoDecimalsFormatter.format(Number(num))
}

export const DomainName = styled(BaseText)`
  font-size: 1.2rem;
  font-weight: bold;
`

export const SearchResultItem = ({ name, available = false, rateONE }) => {
  const priceUsd = calcDomainUSDPrice(name)
  const priceOne = calDomainOnePrice(name, rateONE)

  return (
    <Container>
      <div>{available ? '' : 'Domain Name Unavailable'}</div>
      {available && (
        <Box gap="8px" direction="column">
          <DomainName>{name}.country</DomainName>
          <BaseText>
            {formatONEAmount(priceOne)} ONE = ${formatUSDAmount(priceUsd)} USD
            for 6 months (
            <a
              style={{ color: '#758796' }}
              href="https://harmony.one/1country-terms"
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </a>
            )
          </BaseText>
        </Box>
      )}
    </Container>
  )
}
