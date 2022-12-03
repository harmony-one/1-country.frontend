import React, { useState } from 'react'
import TwitterSection from '../../components/twitter-section/TwitterSection'
import { MdOutlineMail } from 'react-icons/md'
import { TbPhoneCall, TbBrandTelegram } from 'react-icons/tb'
import { Col, Row, FlexRow } from '../../components/Layout'
import { BaseText, SmallText, SmallTextGrey } from '../../components/Text'
import { OnwerLabel, PersonalInfoRevealContainer } from './OwnerInfo.module'

const defaultOwnerInfo = {
  telegram: '',
  email: '',
  phone: ''
}

const OwnerInfo = (props) => {
  const { record, expired, parameters, tweetId, humanD } = props
  const [ownerInfo, setOwnerInfo] = useState(defaultOwnerInfo)

  const reveal = (event) => {
    const { name } = event.target
    let value = ''
    switch (name) {
      case 'telegram':
        value = 'user1234'
        break
      case 'email':
        value = 'email@gmail.com'
        break
      case 'phone':
        value = '+1 555 945 3221'
        break
    }
    setOwnerInfo({ ...ownerInfo, [name]: value })
  }

  return (
    <>
      <Row style={{ marginTop: 16 }}>
        <OnwerLabel>owned by</OnwerLabel>
        <BaseText style={{ wordBreak: 'break-word' }}>
          {record.renter}
        </BaseText>
      </Row>
      <Row>
        <OnwerLabel>purchased on</OnwerLabel>
        <BaseText>
          {' '}
          {new Date(record.timeUpdated).toLocaleString()}
        </BaseText>
      </Row>
      <Row>
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
      <PersonalInfoRevealContainer style={{ marginTop: '1em' }}>
        <FlexRow style={{ justifyContent: 'space-between', paddingBottom: '0.5em' }}>
          <OnwerLabel>Owners's Telegram handle:</OnwerLabel>
          {ownerInfo.telegram && (<b>{ownerInfo.telegram}</b>)}
          <button onClick={reveal} name='telegram'><span style={{ color: '#0088cc', paddingRight: '0.3em' }}><TbBrandTelegram /></span>Reveal</button>
        </FlexRow>
        <FlexRow style={{ justifyContent: 'space-between', paddingBottom: '0.5em' }}>
          <OnwerLabel>Owners's Email address:</OnwerLabel>
          {ownerInfo.email && (<b>{ownerInfo.email}</b>)}
          <button onClick={reveal} name='email'><span style={{ color: '#FBBC05', paddingRight: '0.3em' }}><MdOutlineMail /></span>Reveal</button>
        </FlexRow>
        <FlexRow style={{ justifyContent: 'space-between' }}>
          <OnwerLabel>Owners's Phone number:</OnwerLabel>
          {ownerInfo.phone && (<b>{ownerInfo.phone}</b>)}
          <button onClick={reveal} name='phone'><span style={{ color: 'red', paddingRight: '0.3em' }}><TbPhoneCall /></span>Reveal</button>
        </FlexRow>
      </PersonalInfoRevealContainer>
      {tweetId && (
        <TwitterSection tweetId={tweetId} />
      )}
      {/* <Row style={{ marginTop: 32, justifyContent: 'center' }}> */}
      <Row>
        {record.url && !tweetId && (
          <Col>
            <BaseText>Owner embedded an unsupported link:</BaseText>
            <SmallTextGrey> {record.url}</SmallTextGrey>
          </Col>
        )}
        {!record.url && (
          <BaseText>Owner hasn't embedded any tweet yet</BaseText>
        )}
      </Row>
    </>
  )
}

export default OwnerInfo
