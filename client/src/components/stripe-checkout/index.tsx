import React, { useEffect, useState } from 'react'
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Box } from 'grommet/components/Box'
import {createPaymentIntent, getDomainPrice} from '../../api/payment'
import config from '../../../config'

const stripePromise = loadStripe(config.payments.stripePubKey)

export interface StripeCheckoutFormProps {
  userAddress: string
  domainName: string
}

const CheckoutForm = (props: StripeCheckoutFormProps) => {
  const { userAddress, domainName } = props

  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [domainPrice, setDomainPrice] = useState('0')

  useEffect(() => {
    const getPrice = async () => {
      try {
        const data = await getDomainPrice(domainName)
        console.log('USD domain price', data.usd)
        setDomainPrice(data.usd)
      } catch (e) {
        console.log('Cannot get price', e)
      }
    }
    getPrice()
  }, [domainName])

  useEffect(() => {
    if (stripe && +domainPrice > 0) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: `${domainName}.country domain`,
          amount: +domainPrice
        },
        requestPayerName: true,
        requestPayerEmail: true
      })

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then(result => {
        console.log('Stripe canMakePayment:', result)
        if (result) {
          setPaymentRequest(pr)
        }
      })

      pr.on('paymentmethod', async (e) => {
        console.log('paymentmethod', e)
        let clientSecret = ''
        try {
          clientSecret = await createPaymentIntent(userAddress, domainName)
        } catch (e) {
          console.log('Error on create payment intent:', e)
          return
        }

        const {error: stripeError, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
          payment_method: e.paymentMethod.id
        }, {
          handleActions: false, // Handle next actions in the flow, like 3d-secure
        })

        console.log('stripeError:', stripeError)

        if(stripeError) {
          e.complete('fail');
          return;
        }

        e.complete('success')

        if(paymentIntent.status === 'requires_action') {
          stripe.confirmCardPayment(clientSecret)
        }
      })
    }
  }, [stripe, domainPrice])

  if (paymentRequest) {
    return <Box width={'200px'}>
      <PaymentRequestButtonElement options={{ paymentRequest }} />
    </Box>
  }

  return (
    <Box>
      Cannot get payment request
    </Box>
  )
}

export const StripeCheckout = (props: StripeCheckoutFormProps) => {
  console.log('address', props)
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
