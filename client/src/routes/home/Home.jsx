import React, { useRef, useState } from 'react'
import BN from 'bn.js'
import { toast } from 'react-toastify'
import humanizeDuration from 'humanize-duration'
import AppGallery from '../../components/app-gallery/AppGallery'
import config from '../../../config'
import LastPurchase from '../../components/last-purchase/LastPurchase'
import OwnerForm from '../../components/owner-form/OwnerForm'
import { VanityURL } from './VanityURL'
import { wagmiClient } from '../../modules/wagmi/wagmiClient'
import UserBlock from '../../components/user-block/UserBlock'
import { createCheckoutSession, getTokenPrice } from '../../api/payments'

import {
  Button,
  LinkWrarpper,
} from '../../components/Controls'

import { Col, FlexRow, Row } from '../../components/Layout'
import { BaseText, DescLeft, SmallTextGrey, Title } from '../../components/Text'
import {
  Container,
  HomeLabel,
  DescResponsive,
} from './Home.styles'
import Wallets from '../../components/wallets/Wallets'
import { useOutletContext } from 'react-router'

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

const Home = ({ subdomain = config.tld }) => {
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
    isHarmonyNetwork
  } = useOutletContext()

  const [pending, setPending] = useState(false)
  const toastId = useRef(null)
  const tweet = 'https://twitter.com/harmonyprotocol/status/1619034491280039937?s=20&t=0cZ38hFKKOrnEaQAgKddOg'
  const minCentsAmount = 60

  const onActionFiat = async ({ isRenewal, telegram = '', email = '', phone = '' }) => {
    if (!price) {
      console.error('No domain rental price provided, exit')
      return
    }

    setPending(true)
    let amount = 0

    try {
      const oneTokenPriceUsd = await getTokenPrice('harmony')
      amount = (+price.formatted * +oneTokenPriceUsd) * 100 // price in cents
      if (amount < minCentsAmount) {
        console.log(`Amount ${amount} < min amount ${minCentsAmount} cents, using ${minCentsAmount} cents value. Required by Stripe.`)
        amount = minCentsAmount
      }

      if (!amount) {
        throw new Error(`Invalid USD amount: ${amount}`)
      }

      const pageUrl = new URL(window.location.href)
      const { paymentUrl } = await createCheckoutSession({
        amount: +amount,
        userAddress: walletAddress,
        params: {
          name,
          url: tweet,
          telegram,
          email,
          phone,
        },
        successUrl: `${pageUrl.origin}/success`,
        cancelUrl: `${pageUrl.origin}/cancel`,
      })
      console.log('Stripe checkout link:', paymentUrl)
      window.open(paymentUrl, '_self')
    } catch (e) {
      console.error('Cannot complete payment by USD:', e)
    }
  }

  const onAction = async (params) => {
    const { isRenewal, telegram = '', email = '', phone = '', paymentType = 'one' } = params
    console.log(params)

    if (paymentType === 'usd') {
      onActionFiat(params)
      return
    }

    if (!isHarmonyNetwork) {
      await wagmiClient.connector.connect({ chainId: config.chainParameters.id })
    }

    setPending(true)
    try {
      const f = isOwner && !isRenewal ? client.updateURL : client.rent
      console.log('onAction', price, name)
      toastId.current = toast.loading('Processing transaction')
      await f({
        name,
        url: tweet,
        telegram: telegram,
        email: email,
        phone: phone,
        amount: new BN(price.amount).toString(),
        onFailed: () => toast.update(toastId.current, {
          render: 'Failed to purchase',
          type: 'error',
          isLoading: false,
          autoClose: 2000
        }),
        onSuccess: (tx) => {
          console.log(tx)
          const { transactionHash } = tx
          toast.update(toastId.current, {
            render: (
              <FlexRow>
                <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
                <LinkWrarpper
                  target='_blank'
                  href={client.getExplorerUri(transactionHash)}
                >
                  <BaseText>View transaction</BaseText>
                </LinkWrarpper>
              </FlexRow>),
            type: 'success',
            isLoading: false,
            autoClose: 2000
          })
          setTimeout(() => location.reload(), 1500)
        },
      })
    } catch (ex) {
      console.error(ex)
      toast.error(`Unexpected error: ${ex.toString()}`)
    } finally {
      setPending(false)
    }
  }

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
        <DescLeft>
          <BaseText>How it works:</BaseText>
          <BaseText>
            - go to any *.1.country website (e.g.
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
    <Container>
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
      {!record?.renter && (
        <DescResponsive>
          <VanityURL record={record} name={name} />
          <FlexRow style={{ width: '100%', justifyContent: 'center', marginTop: 30 }}>
            <Title style={{ margin: 0 }}>{name}</Title>
            <a href={`https://${config.tldLink}`} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
              <BaseText style={{ fontSize: 12, color: 'grey', marginLeft: '16px', textDecoration: 'none' }}>
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
      )}
      {/* {!address && <Button onClick={connect} style={{ width: 'auto' }}>CONNECT METAMASK</Button>} */}
      <div style={{ height: 50 }} />
    </Container>
  )
}

export default Home
