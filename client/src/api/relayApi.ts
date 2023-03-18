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
        }
      } catch (ex) {
        console.error(ex)
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
    createCert: async ({
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
          sld,
          // success,
          // domainCreationDate,
          // domainExpiryDate,
          // traceId,
          // reqTime,
          // responseText,
        },
      } = await base.post('/cert', { domain, txHash, address })
      return {
        success,
        sld,
        // domainCreationDate,
        // domainExpiryDate,
        // traceId,
        // reqTime,
        // responseText,
      }
    },
    genNFT: async ({ domain }: { domain: string }) => {
      const {
        data: {
          generated,
          error, //check
          metadata,
        },
      } = await base.post('/gen', { domain })
      return {
        generated,
        error, //check
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
