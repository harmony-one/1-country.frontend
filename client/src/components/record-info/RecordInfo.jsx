/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'

import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai'
import OwnerInfo from '../owner-info/OwnerInfo'
import { BaseText, SmallText, SmallTextGrey, OnwerLabel } from '../../components/Text'
import { Row } from '../../components/Layout'
import { RecordRevealContainer } from './RecordInfo.styles'
// import { OnwerLabel, PersonalInfoRevealContainer } from '../owner-info/OwnerInfo.styles'

const RecordInfo = (props) => {
  const { record, expired, parameters, humanD, client, isOwner, pageName } = props
  const [revealInfo, setRevealInfo] = useState(false)

  const revealEvent = () => {
    setRevealInfo(reveal => !reveal)
  }
  return (
    <RecordRevealContainer>
      <div className='reveal-button' onClick={revealEvent}>
        <OnwerLabel>Reveal Page and Owner information</OnwerLabel>
        <div>{revealInfo ? <AiOutlineUp /> : <AiOutlineDown />}</div>
      </div>
      {revealInfo && (
        <>
          <Row style={{ paddingBottom: '0.5em' }}>
            {/* style={{ marginTop: 16 }} */}
            <OnwerLabel>owned by</OnwerLabel>
            <BaseText style={{ wordBreak: 'break-word' }}>
              {record.renter}
            </BaseText>
          </Row>
          <Row style={{ paddingBottom: '0.5em' }}>
            <OnwerLabel>purchased on</OnwerLabel>
            <BaseText>
              {' '}
              {new Date(record.timeUpdated).toLocaleString()}
            </BaseText>
          </Row>
          <Row style={{ paddingBottom: '0.5em' }}>
            <OnwerLabel>expires on</OnwerLabel>
            <BaseText>
              {' '}
              {new Date(
                record.timeUpdated + parameters.rentalPeriod
              ).toLocaleString()}
            </BaseText>
            {!expired && (
              <SmallTextGrey>
                (in{' '}
                {humanD(
                  record.timeUpdated + parameters.rentalPeriod - Date.now()
                )}
                )
              </SmallTextGrey>
            )}
            {expired && (
              <SmallText style={{ color: 'red' }}>(expired)</SmallText>
            )}
          </Row>
          <OwnerInfo
            client={client}
            pageName={pageName}
            isOwner={isOwner}
          />
        </>
      )}
    </RecordRevealContainer>
  )
}

export default RecordInfo
