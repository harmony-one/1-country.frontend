import axios from 'axios'
import config from '../../config';
import {PaymentIntent} from "@stripe/stripe-js";

const api = axios.create({
  baseURL: config.payments.apiUrl,
  headers: { "Content-Type": "application/json" },
});

export const getDomainPrice = async (domainName: string): Promise<{ one: string, usd: string }> => {
  const { data } = await api.get(`/web3/domainPrice/${domainName}`)
  return data
}

export const validateDomainRent = async (domainName: string): Promise<{ amountOne: string, amountUsd: string }> => {
  const { data } = await api.get(`/stripe/validate/rent/${domainName}`)
  return data
}

export const createPaymentIntent = async (userAddress: string, domainName: string): Promise<PaymentIntent> => {
  const { data } = await api.post('/stripe/create-payment-intent/one-country/rent', {
    userAddress,
    params: {
      domainName
    }
  })
  return data
}

export enum PaymentStatus {
  pending = 'pending', // Payment was initiated by user
  failed = 'failed', // Payment failed on Stripe side
  processing = 'processing', // Payment completed, smart contract call processing by service
  processingFailed = 'processing_failed', // Smart contract call failed on Payments service side
  completed = 'completed', // Payment that has been paid and contract was successfully called.
  expired = 'expired', // Payment session expired on the Stripe side
}

export interface PaymentEntity {
  id: string
  sessionId: string
  method: string
  paymentType: string
  status: PaymentStatus
  txHash: string
  amountUsd: string
  amountOne: string
  userAddress: string
  params: {
    domainName: string
  }
  createdAt: Date
  updatedAt: Date
}

export const getPayment = async (sessionId: string): Promise<PaymentEntity> => {
  const { data } = await api.get(`/stripe/payment/${sessionId}`)
  return data
}

const sleep = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout))

export const waitForPaymentResult = async (sessionId: string): Promise<PaymentEntity> => {
  for(let i=0; i < 60; i++) {
    const data = await getPayment(sessionId)
    if(data && data.txHash) {
      return data
    }
    await sleep(1000)
  }
}
