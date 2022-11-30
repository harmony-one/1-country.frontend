import React from 'react'

import { SmallTextGrey, BaseText } from '../Text'
import { Row } from '../Layout'
import { Banner } from './LastPurchase.module'

const LastPurchase = ({ parameters, tld, lastRentedRecord }) => {
  return (
    <Banner>
      <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <SmallTextGrey>last purchase</SmallTextGrey>
        <a
          href={`https://${parameters.lastRented}${tld}`} target='_blank' rel='noreferrer'
          style={{ color: 'grey', textDecoration: 'none' }}
        >
          <BaseText>{parameters.lastRented}{tld}</BaseText>
        </a>
        <BaseText>({lastRentedRecord.lastPrice.formatted} ONE)</BaseText>
      </Row>
    </Banner>
  )
}

export default LastPurchase
