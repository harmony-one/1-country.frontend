import React, { useEffect } from 'react'
import { Container } from '../home/Home.styles'
import { useStores } from '../../stores'
import { Box } from 'grommet/components/Box'
import { observer } from 'mobx-react-lite'
import { BaseText } from '../../components/Text'
import { calcDomainUSDPrice } from '../../utils/domain'

interface Props {}

const DetailRow: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => {
  return (
    <Box direction="row" gap="4px">
      <Box>
        <BaseText>{label}</BaseText>
      </Box>
      <Box>
        <BaseText>{value}</BaseText>
      </Box>
    </Box>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const DetailsPage: React.FC<Props> = observer(() => {
  const domainName = window.location.search.replace('?', '')

  const { domainStore, ratesStore } = useStores()

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  if (!domainStore.domainRecord) {
    return null
  }

  const priceUsd = calcDomainUSDPrice(
    Number(domainStore.domainPrice.formatted),
    ratesStore.ONE_USD
  )

  const lastPrice = calcDomainUSDPrice(
    Number(domainStore.domainRecord.lastPrice.formatted),
    ratesStore.ONE_USD
  )

  return (
    <Container>
      <Box>
        <DetailRow label="Name:" value={domainName} />
        <DetailRow label="ONE rate:" value={`${ratesStore.ONE_USD} USD`} />

        {!!domainStore.domainRecord.expirationTime && (
          <DetailRow
            label="Expired:"
            value={dateFormat.format(domainStore.domainRecord.expirationTime)}
          />
        )}

        {domainStore.domainRecord.renter && (
          <DetailRow label="owner" value={domainStore.domainRecord.renter} />
        )}

        {!domainStore.domainRecord.renter && (
          <DetailRow
            label="Price:"
            value={`${domainStore.domainPrice.formatted} ONE = ${priceUsd} USD`}
          />
        )}

        {domainStore.domainRecord.renter && (
          <DetailRow
            label="Sold:"
            value={`${domainStore.domainRecord.lastPrice.formatted} ONE = ${lastPrice} USD`}
          />
        )}
      </Box>
    </Container>
  )
})
