import React, { useEffect, useRef, useState } from 'react'
import Web3 from 'web3'
import { Helmet } from 'react-helmet'
// import detectEthereumProvider from '@metamask/detect-provider'
import BN from 'bn.js'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import humanizeDuration from 'humanize-duration'

// import { AiOutlineDoubleRight, AiOutlineDoubleLeft } from 'react-icons/ai'

import AppGallery from '../../components/app-gallery/AppGallery'
import config from '../../../config'
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
// import OwnerInfo from '../../components/owner-info/OwnerInfo'
import LastPurchase from '../../components/last-purchase/LastPurchase'
import OwnerForm from '../../components/owner-form/OwnerForm'
import { VanityURL } from './VanityURL'
import { useDefaultNetwork, useIsHarmonyNetwork } from '../../hooks/network'
import { wagmiClient } from '../../modules/wagmi/wagmiClient'
import UserBlock from '../../components/user-block/UserBlock'
import { useDomainName } from '../../hooks/useDomainName'
import { useClient } from '../../hooks/useClient'

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

const Home = ({ subdomain = config.tld }) => {
  const [name] = useDomainName()
  const [client] = useClient()
  const [record, setRecord] = useState(null)
  const [lastRentedRecord, setLastRentedRecord] = useState(null)
  const [price, setPrice] = useState(null)
  const [parameters, setParameters] = useState({
    rentalPeriod: 0,
    priceMultiplier: 0,
  })

  const [pending, setPending] = useState(false)

  const toastId = useRef(null)
  const { isConnected, address } = useAccount()

  const isOwner =
    address &&
    record?.renter &&
    record.renter.toLowerCase() === address.toLowerCase()

  useDefaultNetwork()

  useEffect(() => {
    if (client) {
      client.getPrice({ name }).then((p) => {
        setPrice(p)
      })
    }
  }, [client, name])

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

  const isHarmonyNetwork = useIsHarmonyNetwork()

  const onAction = async ({ isRenewal, telegram = '', email = '', phone = '' }) => {
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
        url: '', // isRenewal ? '' : tweetId.tweetId.toString(),
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
      <Helmet>
        <title>{name}.1 | Harmony</title>
      </Helmet>
      {record?.renter && (
        <DescResponsive>
          <UserBlock isOwner={isOwner} wallet={address} />
          <AppGallery />
          {(isOwner && isConnected && expired) && (
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
          {isConnected && (
            <OwnerForm onAction={onAction} buttonLabel='Rent' pending={pending} />
          )}
        </DescResponsive>
      )}
      {/* {!address && <Button onClick={connect} style={{ width: 'auto' }}>CONNECT METAMASK</Button>} */}
      <div style={{ height: 50 }} />
    </Container>
  )
}

export default Home
