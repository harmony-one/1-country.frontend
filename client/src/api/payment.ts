import axios from 'axios'
import config from '../../config';

const api = axios.create({
  baseURL: config.payments.apiUrl,
  headers: { "Content-Type": "application/json" },
});

export const getDomainPrice = async (domainName: string): Promise<{ one: string, usd: string }> => {
  const { data } = await api.get(`/web3/domainPrice/${domainName}`)
  return data
}

export const createPaymentIntent = async (userAddress: string, domainName: string): Promise<string> => {
  const { data } = await api.post('/stripe/create-payment-intent/one-country/rent', {
    userAddress,
    params: {
      domainName
    }
  })
  return data.client_secret
}
