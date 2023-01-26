import React, { useEffect, useRef, useState } from 'react'
import Web3 from 'web3'
// import detectEthereumProvider from '@metamask/detect-provider'
import BN from 'bn.js'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/react'
import humanizeDuration from 'humanize-duration'

import { AiOutlineDoubleRight, AiOutlineDoubleLeft } from 'react-icons/ai'

import apis from '../../api'
import config from '../../../config'
import {
  Button,
  FloatingText,
  Input,
  LinkWrarpper,
} from '../../components/Controls'

import { Col, FlexRow, Row } from '../../components/Layout'
import { BaseText, DescLeft, SmallTextGrey, Title } from '../../components/Text'
import {
  Container,
  HomeLabel,
  DescResponsive,
  PageHeader
} from './Home.styles'
import RecordInfo from '../../components/record-info/RecordInfo'
import TwitterSection from '../../components/twitter-section/TwitterSection'
// import OwnerInfo from '../../components/owner-info/OwnerInfo'
import LastPurchase from '../../components/last-purchase/LastPurchase'
import OwnerForm from '../../components/owner-form/OwnerForm'
import { VanityURL } from './VanityURL'
import OwnerInfo from '../../components/owner-info/OwnerInfo'
import { useDefaultNetwork, useIsHarmonyNetwork } from '../../hooks/network'
import { wagmiClient } from '../../modules/wagmi/wagmiClient'
import { createCheckoutSession, getTokenPrice } from '../../api/payments'

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

const minCentsAmount = 70

const parseBN = (n) => {
  try {
    return new BN(n)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

const parseTweetId = (urlInput) => {
  try {
    const url = new URL(urlInput)
    if (url.host !== 'twitter.com') {
      return { error: 'URL must be from https://twitter.com' }
    }
    const parts = url.pathname.split('/')
    const BAD_FORM = {
      error:
        'URL has bad form. It must be https://twitter.com/[some_account]/status/[tweet_id]',
    }
    if (parts.length < 2) {
      return BAD_FORM
    }
    if (parts[parts.length - 2] !== 'status') {
      return BAD_FORM
    }
    const tweetId = parseBN(parts[parts.length - 1])
    if (!tweetId) {
      return { error: 'cannot parse tweet id' }
    }
    return { tweetId: tweetId.toString() }
  } catch (ex) {
    console.error(ex)
    return { error: ex.toString() }
  }
}

const Home = ({ subdomain = config.tld }) => {
  const [name, setName] = useState('')
  const [client, setClient] = useState(apis({}))
  const [record, setRecord] = useState(null)
  const [lastRentedRecord, setLastRentedRecord] = useState(null)
  const [price, setPrice] = useState(null)
  const [parameters, setParameters] = useState({
    rentalPeriod: 0,
    priceMultiplier: 0,
  })
  const [tweetId, setTweetId] = useState('')
  const [pending, setPending] = useState(false)

  const toastId = useRef(null)
  const { isConnected, address, connector } = useAccount()

  // for updating stuff
  const [url, setUrl] = useState('')

  // const name = getSubdomain()

  const isOwner =
    address &&
    record?.renter &&
    record.renter.toLowerCase() === address.toLowerCase()

  useDefaultNetwork()

  useEffect(() => {
    const getSubdomain = () => {
      if (!window) {
        return null
      }
      console.log('getSubDomain()', window.location.host)
      const host = window.location.host
      const parts = host.split('.')
      console.log(host, parts, parts.length)
      if (parts.length <= 2) {
        return ''
      }
      if (parts.length <= 4) { // 3 CHANGE FOR PRODUCTION
        return parts[0]
      }
      return parts.slice(0, parts.length - 2).join('.')
    }

    setName(getSubdomain())
    const web3 = new Web3(config.defaultRPC)
    const api = apis({ web3, address })
    setClient(api)
  }, [])

  useEffect(() => {
    const callApi = async () => {
      const provider = await connector.getProvider()
      const web3 = new Web3(provider)
      const api = apis({ web3, address })
      setClient(api)
      api.getPrice({ name }).then((p) => {
        setPrice(p)
      })
    }
    if (connector && address) {
      callApi()
    }
  }, [connector, address])

  useEffect(() => {
    if (!client) {
      return
    }
    client.getParameters().then((p) => setParameters(p))
    client.getRecord({ name }).then((r) => setRecord(r))
    client.getPrice({ name }).then((p) => setPrice(p))
  }, [client])

  useEffect(() => {
    if (!parameters?.lastRented) {
      return
    }
    client
      .getRecord({ name: parameters.lastRented })
      .then((r) => setLastRentedRecord(r))
  }, [parameters?.lastRented])

  useEffect(() => {
    if (!record?.url) {
      return
    }
    const id = parseBN(record.url)
    if (!id) {
      return
    }
    setTweetId(id.toString())
  }, [record?.url])

  const isHarmonyNetwork = useIsHarmonyNetwork()

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
      const stripeCheckoutLink = await createCheckoutSession({
        amountUsd: +amount,
        amountOne: +price.formatted,
        name,
        url,
        userAddress: address,
        telegram,
        email,
        phone,
        successUrl: `${pageUrl.origin}/success`,
        cancelUrl: `${pageUrl.origin}/cancel`,
      })
      console.log('Stripe checkout link:', stripeCheckoutLink)
      window.open(stripeCheckoutLink, '_blank')
    } catch (e) {
      console.error('Cannot complete payment by USD:', e)
    }
  }

  const onAction = async (params) => {
    const { isRenewal, telegram = '', email = '', phone = '', paymentType = 'one' } = params
    if (!url && !isRenewal) {
      return toast.error('Invalid URL to embed')
    }

    if (!isHarmonyNetwork) {
      await wagmiClient.connector.connect({ chainId: config.chainParameters.id })
    }

    if (paymentType === 'usd') {
      onActionFiat(params)
      return
    }

    setPending(true)
    try {
      const tweetId = isRenewal ? {} : parseTweetId(url)
      if (tweetId.error) {
        return toast.error(tweetId.error)
      }
      const f = isOwner && !isRenewal ? client.updateURL : client.rent
      console.log('onAction', price, name)
      toastId.current = toast.loading('Processing transaction')
      await f({
        name,
        url: isRenewal ? '' : tweetId.tweetId.toString(),
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
      <VanityURL record={record} name={name} />
      <FlexRow style={{ alignItems: 'baseline', marginTop: 70 }}>
        <Title style={{ margin: 0 }}>{name}</Title>
        <a href={`https://${config.tldLink}`} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
          <BaseText style={{ fontSize: 12, color: 'grey', marginLeft: '16px', textDecoration: 'none' }}>
            {subdomain}
          </BaseText>
        </a>
      </FlexRow>
      {record?.renter && (
        <DescResponsive>
          <PageHeader>
            {record.prev &&
              <a href={`https://${record.prev}${config.tld}`} rel='noreferrer' style={{ textDecoration: 'none' }}>
                <FlexRow style={{ gap: 16, textDecoration: 'none', color: 'black' }}>
                  <AiOutlineDoubleLeft />
                </FlexRow>
              </a>}
            <OwnerInfo
              client={client}
              isOwner={isOwner}
              pageName={name}
            />
            {record.next &&
              <a href={`https://${record.next}${config.tld}`} rel='noreferrer' style={{ textDecoration: 'none' }}>
                <FlexRow style={{ gap: 16, textDecoration: 'none', color: 'black' }}>
                  <AiOutlineDoubleRight />
                </FlexRow>
              </a>}
          </PageHeader>
          {tweetId && (
            <TwitterSection tweetId={tweetId} pageName={name} client={client} />
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
          <RecordInfo
            record={record}
            expired={expired}
            parameters={parameters}
            humanD={humanD}
          />
        </DescResponsive>
      )}
      {!isOwner
        ? (
          <>
            <Title style={{ textAlign: 'center' }}>
              Take over this page, embed a tweet you choose
            </Title>
            <Row style={{ marginTop: 16, justifyContent: 'center' }}>
              <HomeLabel>Price</HomeLabel>
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
      {!record?.renter && (
        <Col>
          <Title>Page Not Yet Claimed</Title>
          <SmallTextGrey style={{ marginTop: 32, textAlign: 'center' }}>
            Claim now and embed a tweet you choose
          </SmallTextGrey>
          <Col>
            <Row style={{ marginTop: 32, justifyContent: 'center' }}>
              <HomeLabel>price</HomeLabel>
              <BaseText>{price?.formatted} ONE</BaseText>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <SmallTextGrey>
                for {humanD(parameters.rentalPeriod)}{' '}
              </SmallTextGrey>
            </Row>
          </Col>
        </Col>
      )}
      {!isConnected && <Web3Button />}
      {/* {!address && <Button onClick={connect} style={{ width: 'auto' }}>CONNECT METAMASK</Button>} */}

      {address && (
        <>
          <SmallTextGrey style={{ marginTop: 32 }}>
            Which tweet do you want this page to embed?
          </SmallTextGrey>
          <Row style={{ width: '80%', gap: 0, position: 'relative' }}>
            <Input
              $width='100%'
              $margin='8px'
              value={url}
              onChange={({ target: { value } }) => setUrl(value)}
            />
            <FloatingText>copy the tweet's URL</FloatingText>
          </Row>
          {!isOwner
            ? (
              <OwnerForm onAction={onAction} buttonLabel='Rent (ONE)' pending={pending} />
              )
            : (
              <Button onClick={onAction} disabled={pending}>UPDATE URL</Button>
              )}
          {isOwner && (
            <>
              <Title style={{ marginTop: 64 }}>Renew ownership</Title>
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
          <SmallTextGrey>Your address: {address}</SmallTextGrey>
        </>
      )}
      <SmallTextGrey>
        <a
          href='https://harmony.one/domains'
          rel='noreferrer'
        >
          <SmallTextGrey> Harmony's Creator Economy & Web3 Nations </SmallTextGrey>
        </a>
      </SmallTextGrey>
      <div style={{ height: 200 }} />
    </Container>
  )
}

export default Home
