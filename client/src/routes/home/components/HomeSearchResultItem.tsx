import React from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { BaseText } from '../../../components/Text'
import {
  calcDomainUSDPrice,
  calDomainOnePrice,
  formatONEAmount,
  formatUSDAmount,
} from '../../../utils/domain'

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
  rateONE: number
}

export const HomeSearchResultItem: React.FC<Props> = ({
  name,
  available = false,
  rateONE,
}) => {
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
              href="https://harmonyone.notion.site/harmonyone/Terms-Conditions-6096dbaf43f6402fb4719efaace47a5e"
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
