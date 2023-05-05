import config from '../../../config'
import EWSAbi from '../../../contracts/abi/EWS'
import { type BigNumber, type ContractTransaction, ethers } from 'ethers'
import axios from 'axios'
import { type ExtendedRecordMap } from 'notion-types'
import { type EWS } from '../../../contracts/typechain-types'
import { isValidNotionPageId } from '../../../contracts/ews-common/notion-utils'
console.log('axios', config.ews.server)

const base = axios.create({ baseURL: config.ews.server, timeout: 10000 })

// interface APIResponse {
//   success?: boolean
//   error?: string
// }
export const ewsApi = {
  getNotionPage: async (id: string): Promise<ExtendedRecordMap> => {
    const { data } = await base.get('/notion', { params: { id } })
    return data
  },
  getSameSitePageIds: async (id: string, depth = 0): Promise<string[]> => {
    const { data } = await base.get('/links', { params: { id, depth } })
    return data
  },
  parseNotionPageIdFromRawUrl: async (url: string): Promise<string | null> => {
    const urlObject = new URL(url)
    const path = urlObject.pathname
    const parts = path.split('-')
    const tentativePageId = parts[parts.length - 1]
    if (isValidNotionPageId(tentativePageId)) {
      return tentativePageId
    }
    console.log(`Cannot extract page id from ${url}. Downloading content...`)
    const { data } = await base.post('/parse', { url })
    const { id, error }: { id: string; error: string } = data
    if (error) {
      throw new Error(error)
    }
    if (!id) {
      return null
    }
    return id
  },
}

type EWSType = 0 | 1 | 2

export const EWSTypes: Record<string, EWSType> = {
  EWS_UNKNOWN: 0,
  EWS_NOTION: 1,
  EWS_SUBSTACK: 2,
}

export const ewsContractApi = (
  provider?: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
  signer?: string
) => {
  const etherProvider =
    provider ?? new ethers.providers.StaticJsonRpcProvider(config.defaultRPC)
  let ews = new ethers.Contract(
    config.ews.contract,
    EWSAbi,
    etherProvider
  ) as EWS
  // console.log('EWS CONTRACT', ews)
  // console.log('signer', signer)
  if (signer) {
    ews = ews.connect(signer)
  }
  return {
    ews,
    getBaseFees: async (): Promise<BigNumber> => {
      return await ews.landingPageFee()
    },
    getPerPageFees: async (): Promise<BigNumber> => {
      return await ews.perAdditionalPageFee()
    },
    getPerSubdomainFees: async (): Promise<BigNumber> => {
      return ews.perSubdomainFee()
    },
    getLandingPage: async (sld: string, subdomain: string): Promise<string> => {
      console.log('getLandingPage', sld, subdomain)
      const response = await ews.getLandingPage(
        ethers.utils.id(sld),
        ethers.utils.id(subdomain)
      )
      console.log('getLandingPage response', response)
      return response
    },
    getAllowedPages: async (
      sld: string,
      subdomain: string
    ): Promise<string[]> => {
      return await ews.getAllowedPages(
        ethers.utils.id(sld),
        ethers.utils.id(subdomain)
      )
    },
    getAllowMaintainerAccess: async (sld: string): Promise<boolean> => {
      return await ews.getAllowMaintainerAccess(ethers.utils.id(sld))
    },
    update: async (
      sld: string,
      subdomain: string,
      ewsType: EWSType,
      page: string,
      pages: string[],
      landingPageOnly: boolean
    ): Promise<ContractTransaction> => {
      const fees = await ews.getFees(
        sld,
        subdomain,
        landingPageOnly ? 0 : pages.length
      )
      return await ews.update(
        sld,
        subdomain,
        ewsType,
        page,
        pages,
        landingPageOnly,
        { value: fees }
      )
    },
    appendAllowedPages: async (
      sld: string,
      subdomain: string,
      pages: string[]
    ): Promise<ContractTransaction> => {
      const additionalFees = await ews.perAdditionalPageFee()
      return await ews.appendAllowedPages(sld, subdomain, pages, {
        value: additionalFees.mul(pages.length),
      })
    },
    remove: async (
      sld: string,
      subdomain: string
    ): Promise<ContractTransaction> => {
      return await ews.remove(sld, subdomain)
    },
    hasMaintainerRole: async (address: string): Promise<boolean> => {
      return await ews.hasRole(await ews.MAINTAINER_ROLE(), address)
    },
  }
}

export type EwsClient = ReturnType<typeof ewsContractApi>
