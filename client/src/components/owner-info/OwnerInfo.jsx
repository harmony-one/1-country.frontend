/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import { MdOutlineMail } from 'react-icons/md'
import { TbPhoneCall, TbBrandTelegram } from 'react-icons/tb'

import config from '../../../config'
import TwitterSection from '../../components/twitter-section/TwitterSection'
import { Col, Row, FlexRow } from '../../components/Layout'
import { BaseText, SmallTextGrey, OnwerLabel } from '../../components/Text'
import { PersonalInfoRevealContainer } from './OwnerInfo.styles'
import RecordInfo from '../record-info/RecordInfo'

const defaultOwnerInfo = {
  telegram: '',
  email: '',
  phone: ''
}

const OwnerInfo = (props) => {
  const { record, expired, parameters, tweetId, humanD, client, isOwner, pageName } = props
  const [ownerInfo, setOwnerInfo] = useState(defaultOwnerInfo)
  const { isConnected } = useAccount()
  const toastId = useRef(null)

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
    // const getInfo = async () => {
    //   const info = await client.getAllOwnerInfo({ name: pageName })
    //   setOwnerInfo(info)
    // }
    if (!isOwner) {
      setOwnerInfo(defaultOwnerInfo)
    }
    // else {
    //   getInfo()
    // }
  }, [isOwner])

  console.log(isOwner)

  const reveal = async (event) => {
    if (isConnected) {
      toastId.current = toast.loading('Processing transaction')
      const { name } = event.target
      console.log(name, pageName)
      const info = await client.revealInfo({ name: pageName, info: name })
      if (info) {
        console.log('reveal info', info)
        setOwnerInfo({ ...ownerInfo, [name]: info })
        toast.update(toastId.current, {
          render: 'Transaction success!',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        })
      } else {
        toast.update(toastId.current, {
          render: 'Error processing the transaction',
          type: 'error',
          isLoading: false,
          autoClose: 2000
        })
      }
    } else {
      toast.error('Please connect your wallet')
    }
  }

  return (
    <>
      <RecordInfo
        record={record}
        expired={expired}
        parameters={parameters}
        humanD={humanD}
      />
      <PersonalInfoRevealContainer style={{ marginTop: '1em' }}>
        <FlexRow style={{ justifyContent: 'space-between', paddingBottom: '0.5em' }}>
          <OnwerLabel style={{ width: '185px', textAlign: 'left' }}>{isOwner ? 'Email address:' : 'Owners\'s Email address:'}</OnwerLabel>
          {ownerInfo.email ? ownerInfo.email : (<OnwerLabel>{`Pay ${config.infoRevealPrice.email} to reveal`}</OnwerLabel>)}
          {/* <div className='icon-button' onClick={reveal} name='email'><span style={{ color: '#FBBC05' }}><MdOutlineMail /></span>Reveal</div> */}
          {!isOwner && <button onClick={reveal} name='email'><span style={{ color: '#FBBC05', paddingRight: '0.3em' }}><MdOutlineMail /></span>Reveal</button>}
        </FlexRow>
        <FlexRow style={{ justifyContent: 'space-between', paddingBottom: '0.5em' }}>
          <OnwerLabel style={{ width: '185px', textAlign: 'left' }}>{isOwner ? 'Phone number:' : 'Owners\'s Phone number:'}</OnwerLabel>
          {ownerInfo.phone ? ownerInfo.phone : (<OnwerLabel>{`Pay ${config.infoRevealPrice.phone} to reveal`}</OnwerLabel>)}
          {!isOwner && <button onClick={reveal} name='phone'><span style={{ color: 'red', paddingRight: '0.3em' }}><TbPhoneCall /></span>Reveal</button>}
        </FlexRow>
        <FlexRow style={{ justifyContent: 'space-between' }}>
          <OnwerLabel style={{ width: '185px', textAlign: 'left' }}>{isOwner ? 'Telegram handle:' : 'Owners\'s Telegram handle:'}</OnwerLabel>
          {ownerInfo.telegram ? ownerInfo.telegram : (<OnwerLabel>{`Pay ${config.infoRevealPrice.telegram} to reveal`}</OnwerLabel>)}
          {!isOwner && <button onClick={reveal} name='telegram'><span style={{ color: '#0088cc', paddingRight: '0.3em' }}><TbBrandTelegram /></span>Reveal</button>}
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
