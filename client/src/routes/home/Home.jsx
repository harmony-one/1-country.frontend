import React, { useEffect, useRef, useState } from 'react'
import BN from 'bn.js'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import humanizeDuration from 'humanize-duration'

import config from '../../../config'
import {
  Button,
  LinkWrarpper,
} from '../../components/Controls'

import { FlexColumn, FlexRow, Row } from '../../components/Layout'
import { BaseText, SmallTextGrey, Title } from '../../components/Text'
import { Container, HomeLabel, RecordRenewalContainer } from './Home.styles'
import { VanityURL } from './VanityURL'
import { useDefaultNetwork } from '../../hooks/network'
import { createCheckoutSession, getTokenPrice } from '../../api/payments'
import PageWidgets from '../../components/page-widgets/PageWidgets'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'
import { HomeSearchPage } from './components/HomeSearchPage'
import { getDomainName } from '../../utils/getDomainName'

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

const Home = observer(() => {
  const [name] = useState(getDomainName())
  const [record, setRecord] = useState({})
  const [price, setPrice] = useState(null)
  const [parameters, setParameters] = useState({
    rentalPeriod: 0,
    priceMultiplier: 0,
  })
  const [pending, setPending] = useState(false)

  const toastId = useRef(null)
  const { address } = useAccount()
  // for updating stuff
  const [url] = useState(
    'https://twitter.com/harmonyprotocol/status/1619034491280039937?s=20&t=0cZ38hFKKOrnEaQAgKddOg'
  )

  const { rootStore, domainStore, walletStore } = useStores()

  const client = rootStore.d1dcClient

  useEffect(() => {
    domainStore.loadDomainRecord()
  }, [])

  // const name = getSubdomain()

  const isOwner = domainStore.isOwner

  useDefaultNetwork()

  const pollParams = () => {
    if (!client) {
      return
    }
    client.getParameters().then((p) => setParameters(p))
    client.getRecord({ name }).then((r) => setRecord(r))
    client.getPrice({ name }).then((p) => setPrice(p))
  }

  useEffect(() => {
    if (!walletStore.isConnected && !walletStore.isConnecting) {
      walletStore.connect()
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
    }
  }, [parameters?.lastRented])

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

    if (!walletStore.isHarmonyNetwork || !walletStore.isConnected) { 
      await walletStore.connect()
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
    if (Object.keys(record).length > 0 && !record.renter && name) {
      window.location.href = `${config.hostname}?domain=${name}`
    }
  }, [record])

  if (name === '') {
    return <HomeSearchPage />
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
      {address && (
        <>
          {isOwner && domainStore.isExpired && (
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
})

export default Home
