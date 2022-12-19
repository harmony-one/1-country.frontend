/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import { MdOutlineMail } from 'react-icons/md'
import { TbPhoneCall, TbBrandTelegram } from 'react-icons/tb'

import config from '../../../config'
import TwitterSection from '../../components/twitter-section/TwitterSection'
import { Col, Row, FlexRow } from '../../components/Layout'
import { BaseText, SmallText, SmallTextGrey } from '../../components/Text'
import { OnwerLabel, PersonalInfoRevealContainer } from './OwnerInfo.module'

const defaultOwnerInfo = {
  telegram: '',
  email: '',
  phone: ''
}

const OwnerInfo = (props) => {
  const { record, expired, parameters, tweetId, humanD, client, isOwner, pageName } = props
  const [ownerInfo, setOwnerInfo] = useState(defaultOwnerInfo)
  const { isConnected } = useAccount()

  useEffect(() => {
    const getInfo = async () => {
      const info = await client.getAllOwnerInfo({ name: pageName })
      setOwnerInfo(info)
    }
    if (isOwner) {
      console.log('is owner')
      getInfo()
    }
  }, [])

  useEffect(() => {
    if (!isOwner) {
      setOwnerInfo(defaultOwnerInfo)
    }
  }, [isOwner])

  const reveal = async (event) => {
    if (isConnected) {
      const { name } = event.target
      console.log(name, pageName)
      const info = await client.revealInfo({ name: pageName, info: name })
      console.log('reveal info', info)
      setOwnerInfo({ ...ownerInfo, [name]: info })
    } else {
      toast.error('Please connect your wallet')
    }
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
      
      {/* uncomment the lines below to reveal the personal info container */}
      <PersonalInfoRevealContainer style={{ marginTop: '1em' }}>
        <FlexRow style={{ justifyContent: 'space-between', paddingBottom: '0.5em' }}>
          {/* <OnwerLabel style={{ width: '185px', textAlign: 'left' }}>{isOwner ? 'Email address:' : 'Owners\'s Email address:'}</OnwerLabel>
          {ownerInfo.email ? ownerInfo.email : (<OnwerLabel>{`Pay ${config.infoRevealPrice.email} to reveal`}</OnwerLabel>)}
          {/* <div className='icon-button' onClick={reveal} name='email'><span style={{ color: '#FBBC05' }}><MdOutlineMail /></span>Reveal</div> */}
          {/* {!isOwner && <button onClick={reveal} name='email'><span style={{ color: '#FBBC05', paddingRight: '0.3em' }}><MdOutlineMail /></span>Reveal</button>} */}
        </FlexRow>
        <FlexRow style={{ justifyContent: 'space-between', paddingBottom: '0.5em' }}>
          {/* <OnwerLabel style={{ width: '185px', textAlign: 'left' }}>{isOwner ? 'Phone number:' : 'Owners\'s Phone number:'}</OnwerLabel>
          {ownerInfo.phone ? ownerInfo.phone : (<OnwerLabel>{`Pay ${config.infoRevealPrice.phone} to reveal`}</OnwerLabel>)}
          {!isOwner && <button onClick={reveal} name='phone'><span style={{ color: 'red', paddingRight: '0.3em' }}><TbPhoneCall /></span>Reveal</button>} */}
        </FlexRow>
        <FlexRow style={{ justifyContent: 'space-between' }}>
          {/* <OnwerLabel style={{ width: '185px', textAlign: 'left' }}>{isOwner ? 'Telegram handler:' : 'Owners\'s Telegram handler:'}</OnwerLabel>
          {ownerInfo.telegram ? ownerInfo.telegram : (<OnwerLabel>{`Pay ${config.infoRevealPrice.telegram} to reveal`}</OnwerLabel>)}
          {!isOwner && <button onClick={reveal} name='telegram'><span style={{ color: '#0088cc', paddingRight: '0.3em' }}><TbBrandTelegram /></span>Reveal</button>} */}
        </FlexRow>
      </PersonalInfoRevealContainer>
      
      {tweetId && (
        <TwitterSection tweetId={tweetId} pageName={pageName} client={client} />
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
