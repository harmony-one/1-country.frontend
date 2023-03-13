import axios from 'axios'

const base = axios.create({
  baseURL: process.env.REGISTRAR_RELAYER,
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
      fast,
    }: {
      domain: string
      txHash: string
      address: string
      fast?: 0 | 1
    }) => {
      const {
        data: {
          success,
          domainCreationDate,
          domainExpiryDate,
          traceId,
          reqTime,
          responseText,
          isRegistered,
        },
      } = await base.post('/purchase', { domain, txHash, address, fast })
      return {
        success,
        domainCreationDate,
        domainExpiryDate,
        traceId,
        reqTime,
        responseText,
        isRegistered,
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
          domainCreationDate,
          domainExpiryDate,
          traceId,
          reqTime,
          responseText,
        },
      } = await base.post('/cert', { domain, txHash, address })
      return {
        success,
        domainCreationDate,
        domainExpiryDate,
        traceId,
        reqTime,
        responseText,
      }
    },
  }
}
