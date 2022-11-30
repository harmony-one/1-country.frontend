import React from 'react'

import { SmallTextGrey, BaseText } from '../Text'
import { Row } from '../Layout'
import { Banner } from './LastPurchase.module'

const LastPurchase = ({ parameters, tld, lastRentedRecord, humanD }) => {
  return (
    <Banner>
      <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <SmallTextGrey>last purchase</SmallTextGrey>
        <BaseText>
          {parameters.lastRented}
          {tld} ({lastRentedRecord.lastPrice.formatted} ONE)
        </BaseText>
      </Row>
      <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <SmallTextGrey>
          {humanD(Date.now() - lastRentedRecord.timeUpdated)} ago
        </SmallTextGrey>
        <SmallTextGrey>by {lastRentedRecord.renter}</SmallTextGrey>
      </Row>
    </Banner>
  )
}

export default LastPurchase
