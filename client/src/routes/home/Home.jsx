import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
// import detectEthereumProvider from '@metamask/detect-provider'
import BN from 'bn.js'
import { toast } from 'react-toastify'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/react'

import humanizeDuration from 'humanize-duration'

import apis from '../../api'
import config from '../../../config'
import {
  Banner,
  DescResponsive,
  SmallTextGrey,
  TweetContainerRow,
  Container,
  Label,
} from './home.styles'
import { Col, FlexRow, Row } from '../../components/Layout'

import {
  Button,
  FloatingText,
  Input,
  LinkWrarpper,
} from '../../components/Controls'
import { BaseText, DescLeft, SmallText, Title } from '../../components/Text'

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

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
  // const [web3, setWeb3] = useState(new Web3(config.defaultRPC))
  const [name, setName] = useState('')
  // const [web3] = useState(new Web3(config.defaultRPC))
  // const [address, setAddress] = useState('')
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

  const { isConnected, address, connector } = useAccount()

  // for updating stuff
  const [url, setUrl] = useState('')

  // const name = getSubdomain()

  const isOwner =
    address &&
    record?.renter &&
    record.renter.toLowerCase() === address.toLowerCase()

  // const switchChain = async (address) => {
  //   return window.ethereum
  //     .request({
  //       method: 'wallet_switchEthereumChain',
  //       params: [{ chainId: config.chainParameters.chainId }],
  //     })
  //     .then(() => {
  //       toast.success(
  //         `Switched to network: ${config.chainParameters.chainName}`
  //       )
  //       setClient(apis({ web3, address }))
  //     })
  // }

  // async function init () {
  //   const provider = await detectEthereumProvider()
  //   console.log('provider', provider)
  //   setWeb3(new Web3(provider))
  // }

  // const connect = async () => {
  //   if (!web3) {
  //     toast.error('Wallet not found')
  //     return
  //   }
  //   try {
  //     const ethAccounts = await web3.currentProvider.request({
  //       method: 'eth_requestAccounts',
  //     })

  //     if (ethAccounts.length >= 2) {
  //       return toast.info('Please connect using only one account')
  //     }
  //     const address = ethAccounts[0]
  //     setAddress(address)

  //     try {
  //       await switchChain(address)
  //     } catch (ex) {
  //       console.error(ex)
  //       if (ex.code !== 4902) {
  //         toast.error(
  //           `Failed to switch to network ${config.chainParameters.chainName}: ${ex.message}`
  //         )
  //         return
  //       }
  //       try {
  //         await window.ethereum.request({
  //           method: 'wallet_addEthereumChain',
  //           params: [config.chainParameters],
  //         })
  //         toast.success(
  //           `Added ${config.chainParameters.chainName} Network on MetaMask`
  //         )
  //       } catch (ex2) {
  //         // message.error('Failed to add Harmony network:' + ex.toString())
  //         toast.error(
  //           `Failed to add network ${config.chainParameters.chainName}: ${ex.message}`
  //         )
  //       }
  //     }

  //     window.ethereum.on('accountsChanged', (accounts) =>
  //       setAddress(accounts[0])
  //     )
  //     window.ethereum.on('networkChanged', (networkId) => {
  //       console.log('networkChanged', networkId)
  //       init()
  //     })
  //   } catch (ex) {
  //     console.error(ex)
  //   }
  // }

  useEffect(() => {
    const getSubdomain = () => {
      if (!window) {
        return null
      }
      console.log('getSubDomain()', window.location.host)
      const host = 'egloff2.1.country' // window.location.host
      const parts = host.split('.')
      if (parts.length <= 2) {
        return ''
      }
      if (parts.length <= 3) {
        return parts[0]
      }
      return parts.slice(0, parts.length - 2).join('.')
    }
    setName(getSubdomain())
    const web3 = new Web3(config.defaultRPC)
    const api = apis({ web3, address })
    setClient(api)
    // init()
  }, [])

  // useEffect(() => {
  //   if (web3 && !address) {
  //     connect()
  //   }
  // }, [web3, address])

  useEffect(() => {
    console.log('USE EFFECT connector, address', connector)
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

  const onAction = async ({ isRenewal }) => {
    if (!url && !isRenewal) {
      return toast.error('Invalid URL to embed')
    }
    setPending(true)
    try {
      const tweetId = isRenewal ? {} : parseTweetId(url)
      if (tweetId.error) {
        return toast.error(tweetId.error)
      }
      const f = isOwner && !isRenewal ? client.updateURL : client.rent
      await f({
        name,
        url: isRenewal ? '' : tweetId.tweetId.toString(),
        amount: new BN(price.amount).toString(),
        onFailed: () => toast.error('Failed to purchase'),
        onSuccess: (tx) => {
          console.log(tx)
          const { transactionHash } = tx
          toast.success(
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
              <LinkWrarpper
                target='_blank'
                href={client.getExplorerUri(transactionHash)}
              >
                <BaseText>View transaction</BaseText>
              </LinkWrarpper>
            </FlexRow>
          )
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
          <Banner>
            <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <SmallTextGrey>last purchase</SmallTextGrey>
              <BaseText>
                {parameters.lastRented}
                {config.tld} ({lastRentedRecord.lastPrice.formatted} ONE)
              </BaseText>
            </Row>
            <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <SmallTextGrey>
                {humanD(Date.now() - lastRentedRecord.timeUpdated)} ago
              </SmallTextGrey>
              <SmallTextGrey>by {lastRentedRecord.renter}</SmallTextGrey>
            </Row>
          </Banner>
        )}
        <FlexRow style={{ alignItems: 'baseline', marginTop: 120 }}>
          <Title style={{ margin: 0 }}>Claim your {subdomain}</Title>
        </FlexRow>
        <DescLeft>
          <BaseText>How it works:</BaseText>
          <BaseText>
            - go to any *.1.country website (e.g.{' '}
            <a href='https://crypto.1.country' target='_blank' rel='noreferrer'>
              crypto.1.country
            </a>
            ){' '}
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
      {lastRentedRecord && (
        <Banner>
          <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <SmallTextGrey>last purchase</SmallTextGrey>
            <BaseText>
              {parameters.lastRented}
              {config.tld} ({lastRentedRecord.lastPrice.formatted} ONE)
            </BaseText>
          </Row>
          <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <SmallTextGrey>
              {humanD(Date.now() - lastRentedRecord.timeUpdated)} ago
            </SmallTextGrey>
            <SmallTextGrey>by {lastRentedRecord.renter}</SmallTextGrey>
          </Row>
        </Banner>
      )}
      <FlexRow style={{ alignItems: 'baseline', marginTop: 120 }}>
        <Title style={{ margin: 0 }}>{name}</Title>
        <BaseText style={{ fontSize: 12, color: 'grey', marginLeft: '16px' }}>
          {subdomain}
        </BaseText>
      </FlexRow>
      {record?.renter && (
        <DescResponsive style={{ marginTop: 32 }}>
          <Row>
            <Label>owned by</Label>
            <BaseText style={{ wordBreak: 'break-word' }}>
              {record.renter}
            </BaseText>
          </Row>
          <Row>
            <Label>purchased on</Label>
            <BaseText>
              {' '}
              {new Date(record.timeUpdated).toLocaleString()}
            </BaseText>
          </Row>
          <Row>
            <Label>expires on</Label>
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
          {tweetId && (
            <TweetContainerRow>
              <TwitterTweetEmbed tweetId={tweetId} />
            </TweetContainerRow>
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
                  <Label>Price</Label>
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
        </DescResponsive>
      )}
      {!record?.renter && (
        <Col>
          <Title>Page Not Yet Claimed</Title>
          <SmallTextGrey style={{ marginTop: 32, textAlign: 'center' }}>
            Claim now and embed a tweet you choose
          </SmallTextGrey>
          <Col>
            <Row style={{ marginTop: 32, justifyContent: 'center' }}>
              <Label>price</Label>
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
          <Button onClick={onAction} disabled={pending}>
            {isOwner ? 'UPDATE URL' : 'BUY'}
          </Button>
          {isOwner && (
            <>
              <Title style={{ marginTop: 64 }}>Renew ownership</Title>
              <Row style={{ justifyContent: 'center' }}>
                <Label>renewal price</Label>
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
    </Container>
  )
}

export default Home
