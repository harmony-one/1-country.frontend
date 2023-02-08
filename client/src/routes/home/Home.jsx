import React, { useEffect, useRef, useState } from 'react'
import Web3 from 'web3'
// import detectEthereumProvider from '@metamask/detect-provider'
import BN from 'bn.js'
import { toast } from 'react-toastify'
import { useAccount, useConnect } from 'wagmi'
// import { Web3Button } from '@web3modal/react'
import humanizeDuration from 'humanize-duration'

// import { AiOutlineDoubleRight, AiOutlineDoubleLeft } from 'react-icons/ai'

import apis from '../../api'
import config from '../../../config'
import {
  Button,
  // FloatingText,
  // Input,
  LinkWrarpper,
} from '../../components/Controls'

import { Col, FlexColumn, FlexRow, Row } from '../../components/Layout'
import { BaseText, SmallTextGrey, Title } from '../../components/Text'
import { Container, HomeLabel, RecordRenewalContainer } from './Home.styles'
// import RecordInfo from '../../components/record-info/RecordInfo'
// import TwitterSection from '../../components/twitter-section/TwitterSection'
// import OwnerInfo from '../../components/owner-info/OwnerInfo'
import LastPurchase from '../../components/last-purchase/LastPurchase'
import OwnerForm from '../../components/owner-form/OwnerForm'
import { VanityURL } from './VanityURL'
// import OwnerInfo from '../../components/owner-info/OwnerInfo'
import { useDefaultNetwork, useIsHarmonyNetwork } from '../../hooks/network'
import { wagmiClient } from '../../modules/wagmi/wagmiClient'
import { createCheckoutSession, getTokenPrice } from '../../api/payments'
import { SearchBlock } from '../../components/SearchBlock'
import PageWidgets from '../../components/page-widgets/PageWidgets'

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

const minCentsAmount = 60

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
  // const [tweetId, setTweetId] = useState('')
  const [pending, setPending] = useState(false)

  const toastId = useRef(null)
  const { isConnected, address, connector } = useAccount()
  const { connect, connectors, isLoading } = useConnect()
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
      if (parts.length <= 4) {
        // 3 CHANGE FOR PRODUCTION
        return parts[0]
      }
      return parts.slice(0, parts.length - 2).join('.')
    }
    setUrl(
      'https://twitter.com/harmonyprotocol/status/1619034491280039937?s=20&t=0cZ38hFKKOrnEaQAgKddOg'
    )
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

  const pollParams = () => {
    if (!client) {
      return
    }
    client.getParameters().then((p) => setParameters(p))
    client.getRecord({ name }).then((r) => setRecord(r))
    client.getPrice({ name }).then((p) => setPrice(p))
  }

  useEffect(() => {
    if (!isConnected && !isLoading && connectors) {
      const con = connectors
      connect({ connector: con }) // { connector: connectors[0] })
    }
  }, [])

  useEffect(() => {
    if (!client) {
      return
    }
    pollParams()
  }, [client])

  useEffect(() => {
    if (!parameters?.lastRented) {
      setTimeout(() => {
        console.log('Poll params')
        pollParams()
      }, 12000)
      return
    }
    client
      .getRecord({ name: parameters.lastRented })
      .then((r) => setLastRentedRecord(r))
  }, [parameters?.lastRented])

  // useEffect(() => {
  //   if (!record?.url) {
  //     return
  //   }
  //   const id = parseBN(record.url)
  //   if (!id) {
  //     return
  //   }
  //   setTweetId(id.toString())
  // }, [record?.url])

  const isHarmonyNetwork = useIsHarmonyNetwork()

  const onActionFiat = async ({
    isRenewal,
    telegram = '',
    email = '',
    phone = '',
  }) => {
    if (!price) {
      console.error('No domain rental price provided, exit')
      return
    }

    setPending(true)
    let amount = 0

    try {
      const oneTokenPriceUsd = await getTokenPrice('harmony')
      amount = +price.formatted * +oneTokenPriceUsd * 100 // price in cents
      if (amount < minCentsAmount) {
        console.log(
          `Amount ${amount} < min amount ${minCentsAmount} cents, using ${minCentsAmount} cents value. Required by Stripe.`
        )
        amount = minCentsAmount
      }

      if (!amount) {
        throw new Error(`Invalid USD amount: ${amount}`)
      }

      const tweetId = isRenewal ? {} : parseTweetId(url)

      const pageUrl = new URL(window.location.href)
      const { paymentUrl } = await createCheckoutSession({
        amount: +amount,
        userAddress: address,
        params: {
          name,
          url: isRenewal ? '' : tweetId.tweetId.toString(),
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
    const {
      isRenewal,
      telegram = '',
      email = '',
      phone = '',
      paymentType = 'one',
    } = params
    if (!url && !isRenewal) {
      return toast.error('Invalid URL to embed')
    }

    if (!isHarmonyNetwork) {
      await wagmiClient.connector.connect({
        chainId: config.chainParameters.id,
      })
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
        onFailed: () =>
          toast.update(toastId.current, {
            render: 'Failed to purchase',
            type: 'error',
            isLoading: false,
            autoClose: 2000,
          }),
        onSuccess: (tx) => {
          console.log(tx)
          const { transactionHash } = tx
          toast.update(toastId.current, {
            render: (
              <FlexRow>
                <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
                <LinkWrarpper
                  target="_blank"
                  href={client.getExplorerUri(transactionHash)}
                >
                  <BaseText>View transaction</BaseText>
                </LinkWrarpper>
              </FlexRow>
            ),
            type: 'success',
            isLoading: false,
            autoClose: 2000,
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

  useEffect(() => {
    if (record && !record.render) {
      window.location.href = `https://${config.tldLink}?domain=${name}`
    }
  }, [record])

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
        {client && (
          <FlexRow
            style={{ alignItems: 'baseline', marginTop: 80, width: '100%' }}
          >
            <SearchBlock client={client} />
          </FlexRow>
        )}
      </Container>
    )
  }

  return (
    <Container>
      <VanityURL record={record} name={name} />
      <div style={{ height: '2em' }} />
      {!record && (
        <FlexColumn
          style={{
            marginTop: '10em',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          Uploading...
        </FlexColumn>
      )}
      {record && record?.renter && (
        <PageWidgets
          isOwner={isOwner}
          style={{ marginTop: '6em' }}
          showAddButton={isOwner}
        />
      )}
      {record && !record?.renter && (
        <Col>
          <Title>Page Not Yet Claimed</Title>
          <SmallTextGrey style={{ marginTop: 32, textAlign: 'center' }}>
            Claim now
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
      {address && (
        <>
          {!isOwner && (
            <OwnerForm
              onAction={onAction}
              buttonLabel="Rent (ONE)"
              pending={pending}
            />
          )}
          {isOwner && expired && (
            <RecordRenewalContainer>
              <Title style={{ marginTop: 16 }}>Renew ownership</Title>
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
            </RecordRenewalContainer>
          )}
          <SmallTextGrey>Your address: {address}</SmallTextGrey>
        </>
      )}
      <SmallTextGrey>
        <a href="https://harmony.one/domains" rel="noreferrer">
          <SmallTextGrey>
            {' '}
            Harmony's Creator Economy & Web3 Nations{' '}
          </SmallTextGrey>
        </a>
      </SmallTextGrey>
      <div style={{ height: 200 }} />
    </Container>
  )
}

export default Home
