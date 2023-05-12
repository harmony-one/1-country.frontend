import React, { useEffect, useState } from 'react'
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js'
import {loadStripe, PaymentRequestPaymentMethodEvent, StripeError} from '@stripe/stripe-js'
import { Box } from 'grommet/components/Box'
import {createPaymentIntent, validateDomainRent} from '../../api/payment'
import config from '../../../config'

const stripePromise = loadStripe(config.payments.stripePubKey)

export interface StripeCheckoutFormProps {
  userAddress: string
  domainName: string
  onStartPayment?: (e: PaymentRequestPaymentMethodEvent) => void
  onSuccess?: (paymentIntentId: string) => void
  onError?: (e: StripeError) => void
}

const CheckoutForm = (props: StripeCheckoutFormProps) => {
  const { userAddress, domainName } = props

  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [domainPrice, setDomainPrice] = useState('0')

  useEffect(() => {
    const getPrice = async () => {
      try {
        const data = await validateDomainRent(domainName)
        console.log(`Domain price: ${data.amountUsd} usd cents (${data.amountOne} one)`)
        setDomainPrice(data.amountUsd)
      } catch (e) {
        console.log('Cannot get domain price:', e)
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
        if(props.onStartPayment) {
          props.onStartPayment(e)
        }
        console.log('paymentmethod', e)
        let clientSecret = ''
        let paymentIntentId = ''

        try {
          const intent = await createPaymentIntent(userAddress, domainName)
          const { id, client_secret } = intent
          clientSecret = client_secret
          paymentIntentId = id
          console.log('Payment intent id: ', id)
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
          if(props.onError) {
            props.onError(stripeError)
          }
          return;
        }

        e.complete('success')
        if(props.onSuccess) {
          props.onSuccess(paymentIntentId)
        }

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
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
