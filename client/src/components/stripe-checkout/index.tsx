import React, { useEffect, useState } from 'react'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import {CanMakePaymentResult, loadStripe, PaymentRequestPaymentMethodEvent, StripeError} from '@stripe/stripe-js'
import { Box } from 'grommet/components/Box'
import {createPaymentIntent, validateDomainRent} from '../../api/payment'
import config from '../../../config'
import styled from "styled-components";
import {Button} from "grommet/components/Button";
import LinkLogo from '../../../assets/images/stripe_link.svg';
import GooglePayLogo from '../../../assets/images/google_pay.svg';
import AppleLogo from '../../../assets/images/apple_white.svg';

const stripePromise = loadStripe(config.payments.stripePubKey)

export interface StripeCheckoutFormProps {
  disabled: boolean
  userAddress: string
  domainName: string
  onPaymentInitiated?: () => void
  onPaymentStarted?: (e: PaymentRequestPaymentMethodEvent) => void
  onSuccess?: (paymentIntentId: string) => void
  onError?: (e: StripeError) => void
}

const ApplePayButton = styled(Button)`
    display: flex;
    justify-content: center;
    width: 120px;
    border-radius: 4px;
    background-color: black;
    text-align: center;
    color: white;
    font-size: 19px;
    padding: 10px 48px;
    text-align: center;
`


const GooglePayButton = styled(Button)`
    width: 120px;
    display: flex;
    text-align: center;
    border-radius: 100vh;
    background-color: black;
    color: white;
    padding: 10px 32px;
    text-align: center;
`

const LinkButton = styled(Button)`
    width: 120px;
    height: 40px;
    display: flex;
    text-align: center;
    justify-content: center;
    align-content: center;
    border-radius: 6px;
    background-color: #009788;
    color: white;
    padding: 10px 32px;
    
    svg {
        padding-top: 2px;
    }
`

const CheckoutForm = (props: StripeCheckoutFormProps) => {
  const { userAddress, domainName } = props

  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [canMakePayment, setCanMakePayment] = useState<CanMakePaymentResult>()
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
        setCanMakePayment(result)
        if (result) {
          setPaymentRequest(pr)
        }
      })

      pr.on('paymentmethod', async (e) => {
        if(props.onPaymentStarted) {
          props.onPaymentStarted(e)
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

  const onPayClicked = async () => {
    try {
      if(props.onPaymentInitiated) {
        await props.onPaymentInitiated()
      }
      if(paymentRequest) {
        paymentRequest.show()
      }
    } catch (e) {
      console.log('Cannot start stripe payment', e)
    }
  }

  let buttonContent = null

  if(canMakePayment) {
    const { applePay, googlePay, link }  = canMakePayment
    if(applePay) {
      buttonContent = <ApplePayButton
        disabled={props.disabled}
        onClick={onPayClicked}>
        <img src={AppleLogo} width={'16px'} alt={'Apple Pay'} />
      </ApplePayButton>
    } else if(googlePay) {
      buttonContent = <GooglePayButton disabled={props.disabled} onClick={onPayClicked}>
        <img src={GooglePayLogo} width={'48px'} alt={'Google Pay'}/>
      </GooglePayButton>
    } else if(link) {
      buttonContent = <LinkButton disabled={props.disabled} onClick={onPayClicked}>
        <img src={LinkLogo} width={'32px'} height={'20px'} alt={'Stripe Link'} />
      </LinkButton>
    }
  }

  return <Box width={'200px'}>
    {buttonContent}
  </Box>
}

export const StripeCheckout = (props: StripeCheckoutFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
