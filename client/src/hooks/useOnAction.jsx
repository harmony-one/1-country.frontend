import React, { useRef } from 'react'
import { toast } from 'react-toastify'
import { wagmiClient } from '../modules/wagmi/wagmiClient'
import BN from 'bn.js'

import config from '../../config'
import { createCheckoutSession, getTokenPrice } from '../api/payments'

import { LinkWrarpper } from '../components/Controls'
import { FlexRow } from '../components/Layout'
import { BaseText } from '../components/Text'

const useOnAction = (props) => {
  const {
    setPending,
    price,
    walletAddress,
    isHarmonyNetwork,
    isOwner,
    client,
    name
  } = props

  const toastId = useRef(null)
  const tweet = 'https://twitter.com/harmonyprotocol/status/1619034491280039937?s=20&t=0cZ38hFKKOrnEaQAgKddOg'
  const minCentsAmount = 60

  const onActionFiat = async (params) => {
    const {
      telegram = '',
      email = '',
      phone = ''
    } = params
    console.log(price)
    if (!price) {
      console.error('No domain rental price provided, exit')
      throw new Error('No domain rental price provided')
    }

    setPending(true)
    let amount = 0
    toast.info('Redirecting to Stripe')
    try {
      const oneTokenPriceUsd = await getTokenPrice('harmony')
      amount = Math.round((+price.formatted * +oneTokenPriceUsd) * 100) // price in cents
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
      toast.error(`Cannot complete payment by USD: ${e.toString()}`)
      console.error('Cannot complete payment by USD:', e)
    }
  }

  const onAction = async (params) => {
    const {
      isRenewal,
      telegram = '',
      email = '',
      phone = '',
      paymentType = 'one'
    } = params

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

  return { onAction }
}

export default useOnAction
