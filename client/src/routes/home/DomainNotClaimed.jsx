import React, { useState } from 'react'

import useOnAction from '../../hooks/useOnAction'
import OwnerForm from '../../components/owner-form/OwnerForm'
import Wallets from '../../components/wallets/Wallets'

import { Col, FlexRow, Row } from '../../components/Layout'
import { BaseText, SmallTextGrey, Title } from '../../components/Text'
import { VanityURL } from './VanityURL'
import { DescResponsive, HomeLabel } from './Home.styles'
import config from '../../../config'

const DomainNotClaimed = ({
  record,
  name,
  subdomain,
  humanD,
  parameters,
  price,
  isClientConnected,
  walletAddress,
  isHarmonyNetwork,
  client
}) => {
  const [pending, setPending] = useState(false)

  const { onAction } = useOnAction({
    name,
    setPending,
    price,
    walletAddress,
    isHarmonyNetwork,
    isOwner: false,
    client
  })

  return (
    <DescResponsive>
      <VanityURL record={record} name={name} />
      <FlexRow style={{ width: '100%', justifyContent: 'center', marginTop: 30 }}>
        <Title style={{ margin: 0 }}>{name}</Title>
        <a href={`https://${config.tldLink}`} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
          <BaseText style={{ fontSize: '0.9rem', color: 'grey', marginLeft: '16px', textDecoration: 'none' }}>
            {subdomain}
          </BaseText>
        </a>
      </FlexRow>
      <Col>
        <Title>Page Not Yet Claimed</Title>
        <SmallTextGrey style={{ textAlign: 'center' }}>
          Claim now
        </SmallTextGrey>
        <Col>
          <Row style={{ justifyContent: 'center' }}>
            <HomeLabel>price</HomeLabel>
            <BaseText>{price?.formatted} ONE</BaseText>
          </Row>
          <Row style={{ justifyContent: 'center', marginBottom: '1em' }}>
            <SmallTextGrey>
              for {humanD(parameters.rentalPeriod)}{' '}
            </SmallTextGrey>
          </Row>
        </Col>
      </Col>
      {isClientConnected && (
        <OwnerForm onAction={onAction} buttonLabel='Rent' pending={pending} />
      )}
      <Wallets />
    </DescResponsive>
  )
}

export default DomainNotClaimed
