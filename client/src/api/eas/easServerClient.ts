import axios from 'axios'
import config from '../../../config'

const base = axios.create({ baseURL: config.eas.apiHost, timeout: 10000 })

interface APIResponse {
  success?: boolean
  error?: string
}
export const easServerClient = {
  activate: async function (
    sld: string,
    alias: string,
    forwardAddress: string,
    signature: string
  ): Promise<APIResponse> {
    const { data } = await base.post('/activate', {
      sld,
      alias,
      forwardAddress,
      signature,
    })
    return data
  },

  deactivate: async function (
    sld: string,
    alias: string
  ): Promise<APIResponse> {
    const { data } = await base.post('/deactivate', { sld, alias })
    return data
  },

  deactivateAll: async function (sld: string): Promise<APIResponse> {
    const { data } = await base.post('/deactivate-all', { sld })
    return data
  },

  check: async function (sld: string, alias: string): Promise<boolean> {
    const { data } = await base.post('/check-alias', { sld, alias })
    return data.exist
  },
}
