import axios from 'axios'
import config from '../../config'

const paymentsApi = axios.create({
  baseURL: config.payments.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

export const createPaymentIntent = async (paymentMethodType = 'card', currency = 'usd') => {
  const { data } = await paymentsApi.post('/stripe/create-payment-intent', {
    paymentMethodType,
    currency
  })
  return data.clientSecret
}

export const createCheckoutSession = async (params) => {
  const { data } = await paymentsApi.post('/stripe/checkout-one-country', {
    ...params
  })
  return data
}

// Coingecko token id https://www.coingecko.com/en/api/documentation
export const getTokenPrice = async (tokenId = 'harmony') => {
  const { data } = await paymentsApi.get(`/web3/price/${tokenId}`)
  return data
}
