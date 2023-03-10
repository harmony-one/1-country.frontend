import axios from 'axios'
import config from '../../config'

const base = axios.create({
  baseURL: config.backendHost,
})

interface Domain {
  id: string
  domain: string
  createdTxHash: string
}

export const mainApi = {
  createDomain: ({ domain, txHash }: { domain: string; txHash: string }) => {
    return base.post<{ data: Domain }>(`/domains/`, {
      domain,
      txHash,
    })
  },
  loadDomain: async ({ domain }: { domain: string }) => {
    const response = await base.get<{ data: Domain }>(`/domains/${domain}`)
    return response.data.data
  },
}
