import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'

import AppGallery from '../../components/app-gallery/AppGallery'
import config from '../../../config'
import LastPurchase from '../../components/last-purchase/LastPurchase'
import UserBlock from '../../components/user-block/UserBlock'

import {
  Button,
} from '../../components/Controls'

import { FlexRow, Row } from '../../components/Layout'
import { BaseText, DescLeft, SmallTextGrey, Title } from '../../components/Text'
import {
  Container,
  HomeLabel,
  DescResponsive,
} from './Home.styles'
import { useNavigate, useOutletContext } from 'react-router'
import { SearchBlock } from '../../components/SearchBlock'
import useOnAction from '../../hooks/useOnAction'

const Home = ({ subdomain = config.tld }) => {
  const navigate = useNavigate()
  const {
    record,
    lastRentedRecord,
    price,
    parameters,
    name,
    client,
    walletAddress,
    isClientConnected,
    isOwner,
    isHarmonyNetwork,
    humanD
  } = useOutletContext()

  const swipePage = (eventData) => {
    console.log('SWIPEPAGE', eventData)
    const direction = eventData.dir
    let url = ''
    if (direction === 'Left') {
      url = record.next && `https://${record.next}${config.tld}`
    } else {
      url = record.prev && `https://${record.prev}${config.tld}`
    }
    if (url) {
      window.location.assign(url)
      navigate('/')
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => swipePage(eventData),
    onSwipedRight: (eventData) => swipePage(eventData),
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  const [pending, setPending] = useState(false)

  const { onAction } = useOnAction({
    name,
    setPending,
    price,
    walletAddress,
    isHarmonyNetwork,
    isOwner,
    client
  })

  const expired =
    record?.timeUpdated + parameters?.rentalPeriod - Date.now() < 0

  if (name === '') {
    return (
      <Container>
        {lastRentedRecord && (
          <LastPurchase
            parameters={parameters}
            tld={config.tld}
            lastRentedRecord={lastRentedRecord}
            humanD={humanD}
          />
        )}
        <FlexRow style={{ alignItems: 'baseline', marginTop: 120 }}>
          <Title style={{ margin: 0 }}>Claim your {subdomain}</Title>
        </FlexRow>
        <FlexRow style={{ alignItems: 'baseline', marginTop: 40, marginBottom: 20, width: '100%' }}>
          <SearchBlock client={client} />
        </FlexRow>
        <DescLeft>
          <BaseText>How it works:</BaseText>
          <BaseText>
            - search any *.1.country website (e.g.
            <a href='https://all.1.country' target='_blank' rel='noreferrer'>
              all.1.country
            </a>)
          </BaseText>
          <BaseText>
            - if you are the first, pay{' '}
            {parameters?.baseRentalPrice?.formatted || '100'} ONE to claim the
            page for {humanD(parameters?.rentalPeriod) || '3 months'}
          </BaseText>
          <BaseText>
            - otherwise, pay double the last person paid to claim the page
          </BaseText>
          <BaseText>
            - once claimed, you can embed any tweet on your page!
          </BaseText>
        </DescLeft>
      </Container>
    )
  }

  return (
    <Container {...handlers}>
      {/* <Helmet>
        <title>{name}.1 | Harmony</title>
      </Helmet> */}
      {record?.renter && (
        <DescResponsive>
          <UserBlock isOwner={isOwner} client={client} walletAddress={walletAddress} isClientConnected={isClientConnected} />
          <AppGallery />
          {(isOwner && isClientConnected && expired) && (
            <>
              <Title>Renew ownership</Title>
              <Row style={{ justifyContent: 'center' }}>
                <HomeLabel>renewal price</HomeLabel>
                <BaseText>{price?.formatted} ONE</BaseText>
              </Row>
              <SmallTextGrey>
                for {humanD(parameters.rentalPeriod)}{' '}
              </SmallTextGrey>
              <Button
                onClick={() => onAction({ isRenewal: true })}
                disabled={pending}
              >
                RENEW
              </Button>
            </>
          )}
        </DescResponsive>
      )}
      {/* {!address && <Button onClick={connect} style={{ width: 'auto' }}>CONNECT METAMASK</Button>} */}
      <div style={{ height: 50 }} />
    </Container>
  )
}

export default Home
