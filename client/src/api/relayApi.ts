import axios from 'axios'
import config from '../../config'

const base = axios.create({
  baseURL: config.registrar,
})
export const relayApi = () => {
  return {
    checkDomain: async ({ sld }: { sld: string }) => {
      try {
        const {
          data: {
            isAvailable,
            isReserved,
            isRegistered,
            regPrice,
            renewPrice,
            transferPrice,
            restorePrice,
            responseText,
            error = '',
          },
        } = await base.post('/check-domain', { sld })
        return {
          isAvailable,
          isReserved,
          isRegistered,
          regPrice,
          renewPrice,
          transferPrice,
          restorePrice,
          responseText,
          error,
        }
      } catch (ex) {
        console.error('checkDomain', ex)
        return { error: ex.toString() }
      }
    },
    purchaseDomain: async ({
      domain,
      txHash,
      address,
    }: {
      domain: string
      txHash: string
      address: string
    }) => {
      const {
        data: {
          success,
          domainCreationDate,
          domainExpiryDate,
          traceId,
          reqTime,
          responseText,
        },
      } = await base.post('/purchase', { domain, txHash, address, fast: 1 })
      return {
        success,
        domainCreationDate,
        domainExpiryDate,
        traceId,
        reqTime,
        responseText,
      }
    },
    createCert: async ({ domain }: { domain: string }) => {
      const {
        data: { success, sld },
      } = await base.post('/cert', { domain })
      return {
        success,
        sld,
      }
    },
    genNFT: async ({ domain }: { domain: string }) => {
      const {
        data: { generated, metadata },
      } = await base.post('/gen', { domain })
      return {
        generated,
        metadata,
      }
    },
  }
}

export class RelayError extends Error {
  constructor(readonly message: string) {
    super(message)
    this.name = 'RelayError'
  }
}
