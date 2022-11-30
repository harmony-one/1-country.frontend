import React from 'react'
import TwitterSection from '../../components/twitter-section/TwitterSection'
import { MdOutlineMail } from 'react-icons/md'
import { TbPhoneCall, TbBrandTelegram } from 'react-icons/tb'
import { Col, Row } from '../../components/Layout'
import { BaseText, SmallText, Title, SmallTextGrey } from '../../components/Text'
import { OnwerLabel } from './OwnerInfo.module'

const OwnerInfo = ({ isOwner, tld, record, expired, parameters, price, tweetId, humanD }) => {
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
      <Row>
        <OnwerLabel>Telegram handle:</OnwerLabel>
        <button><span style={{ color: '#0088cc', paddingRight: '0.3em' }}><TbBrandTelegram /></span>Reveal</button>
      </Row>
      <Row>
        <OnwerLabel>Email address:</OnwerLabel>
        <button><span style={{ color: '#FBBC05', paddingRight: '0.3em' }}><MdOutlineMail /></span>Reveal</button>
      </Row>
      <Row>
        <OnwerLabel>Phone number:</OnwerLabel>
        <button><span style={{ color: 'red', paddingRight: '0.3em' }}><TbPhoneCall /></span>Reveal</button>
      </Row>
      {tweetId && (
        <TwitterSection tweetId={tweetId} />
      )}
      <Row style={{ marginTop: 32, justifyContent: 'center' }}>
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
      {!isOwner
        ? (
          <>
            <Title style={{ marginTop: 32, textAlign: 'center' }}>
              Take over this page, embed a tweet you choose
            </Title>
            <Row style={{ marginTop: 16, justifyContent: 'center' }}>
              <OnwerLabel>Price</OnwerLabel>
              <BaseText>{price?.formatted} ONE</BaseText>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <SmallTextGrey>
                for {humanD(parameters.rentalPeriod)}{' '}
              </SmallTextGrey>
            </Row>
          </>
          )
        : (
          <Title style={{ marginTop: 32, textAlign: 'center' }}>
            You own this page
          </Title>
          )}
    </>
  )
}

export default OwnerInfo
