import React, { useEffect, useState } from 'react'
import { Container } from '../home/Home.styles'
import { useStores } from '../../stores'
import { Box, BoxProps } from 'grommet/components/Box'
import { observer } from 'mobx-react-lite'
import { BaseText } from '../../components/Text'
import { calcDomainUSDPrice } from '../../utils/domain'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import { DomainMeta, nameWrapperApi } from '../../nameWrapperApi'

interface Props {}

const DetailRow: React.FC<
  { label: string; value: React.ReactNode } & BoxProps
> = ({ direction = 'row', label, value }) => {
  return (
    <Box direction={direction} gap="4px">
      <BaseText>{label}</BaseText>
      <BaseText>{value}</BaseText>
    </Box>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const DetailsPage: React.FC<Props> = observer(() => {
  const domainName = window.location.search.replace('?', '')
  const [domainMeta, setDomainMeta] = useState<DomainMeta | null>(null)

  const { domainStore, ratesStore } = useStores()

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  useEffect(() => {
    if (domainStore?.domainRecord?.renter) {
      nameWrapperApi.loadDomainMeta(domainName + '.country').then((meta) => {
        setDomainMeta(meta)
      })
    }
  }, [domainStore?.domainRecord?.renter])

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
      <Box gap="8px">
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
        {domainStore?.domainRecord?.renter && (
          <TransactionWidget name={domainName} domainStore={domainStore} />
        )}
        {domainMeta && (
          <>
            <DetailRow
              label="Image"
              direction="column"
              value={
                <img
                  width="100"
                  alt="domain image"
                  height="100"
                  src={domainMeta.image}
                />
              }
            />
            {domainMeta.attributes.map((attr) => {
              return <DetailRow label={attr.trait_type} value={attr.value} />
            })}
          </>
        )}
      </Box>
    </Container>
  )
})

export default DetailsPage
