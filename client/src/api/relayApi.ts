import axios from 'axios'
import config from '../../config'
import logger from '../modules/logger'
import _ from 'lodash'
const log = logger.module('RelayApi')

const base = axios.create({
  baseURL: config.registrar,
  timeout: 10000,
})

export interface ParsedNftMetada {
  expirationDate: string
  image: string
  name: string
  registrationDate: string
  tier: string
  length: number
}

export interface RenewNftMetada {
  renewed: boolean
  metadata?: any
  expiry?: any
  error?: string
}

export interface RenewCert {
  success: boolean
  sld?: string
  mcJobId?: any
  nakedJobId?: any
  error?: any
  certExist?: boolean
}

export const relayApi = () => {
  return {
    enableSubdomains: async (domainName: string) => {
      try {
        const { data } = await base.post('/enable-subdomains', {
          domain: `${domainName}${config.tld}`,
        })
        console.log('enableSubdomains', data)
      } catch (e) {
        console.log('enableSubdomains error', e)
      }
    },
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
        log.error('checkDomain', { error: ex })
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
      const response = await base.post('/cert', { domain })
      const { success, wcJobId, nakedJobId, sld } = response.data
      console.log('creatCert response', success, wcJobId, nakedJobId, sld)
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
    getNFTMetadata: async ({
      domain,
    }: {
      domain: string
    }): Promise<ParsedNftMetada> => {
      const {
        data: { metadata },
      } = await base.post('/gen', { domain })
      if (metadata) {
        const metaDataUrl = metadata.erc721Metadata
          ? metadata.erc721Metadata
          : metadata.erc1155Metadata
        const {
          data: { name, image, attributes },
        } = await axios.get(metaDataUrl)
        if (attributes) {
          const attr = attributes.reduce(
            (
              acc: { [x: string]: any },
              obj: { trait_type: string; value: any }
            ) => {
              acc[_.camelCase(obj.trait_type)] = obj.value
              return acc
            },
            {}
          )
          return {
            name,
            image,
            ...attr,
          }
        }
      }
    },
    renewMetadata: async ({
      domain,
    }: {
      domain: string
    }): Promise<RenewNftMetada> => {
      const {
        data: { renewed, metadata, expiry, error },
      } = await base.post('/renew-metadata', { domain })
      return {
        renewed,
        metadata,
        expiry,
        error,
      }
    },
    certStatus: async ({ domain }: { domain: string }): Promise<any> => {
      console.log('certStatus function', domain)
      try {
        const response = await base.post('/cert-job-lookup', { domain })
        console.log('certStatus', domain, response)
        return response.data
      } catch (ex) {
        console.log('certStatus error', ex)
        return ex
      }
    },
    renewCert: async ({ domain }: { domain: string }): Promise<RenewCert> => {
      try {
        const {
          data: { success, sld, mcJobId, nakedJobId, error },
        } = await base.post('/renew-cert', { domain })
        return {
          success,
          sld,
          mcJobId,
          nakedJobId,
          error,
        }
      } catch (e) {
        console.log('renewCert', { e })
        return {
          success: false,
          error: e,
          certExist: !e.response.data.error.includes('does not exist'),
        }
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
