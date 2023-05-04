import config from '../../config'
import EWSAbi from '../../contracts/abi/EWS'
import IDCAbi from '../../contracts/abi/DCv2'
import { type BigNumber, type ContractTransaction, ethers } from 'ethers'
import axios from 'axios'
import { type ExtendedRecordMap } from 'notion-types'
import { type EWS, type IDC } from '../../contracts/typechain-types'
import { isValidNotionPageId } from '../../contracts/ews-common/notion-utils'
const base = axios.create({ baseURL: config.ews.server, timeout: 10000 })

// interface APIResponse {
//   success?: boolean
//   error?: string
// }
export const apis = {
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Client {
  ews: EWS
  dc: () => Promise<IDC>
  hasMaintainerRole: (address: string) => Promise<boolean>
  getOwner: (sld: string) => Promise<string>
  getAllowMaintainerAccess: (sld: string) => Promise<boolean>
  getExpirationTime: (sld: string) => Promise<number>
  getBaseFees: () => Promise<BigNumber>
  getPerPageFees: () => Promise<BigNumber>
  getPerSubdomainFees: () => Promise<BigNumber>
  getLandingPage: (sld: string, subdomain: string) => Promise<string>
  getAllowedPages: (sld: string, subdomain: string) => Promise<string[]>
  update: (
    sld: string,
    subdomain: string,
    ewsType: EWSType,
    page: string,
    pages: string[],
    landingPageOnly: boolean
  ) => Promise<ContractTransaction>
  appendAllowedPages: (
    sld: string,
    subdomain: string,
    pages: string[]
  ) => Promise<ContractTransaction>
  remove: (sld: string, subdomain: string) => Promise<ContractTransaction>
}

export const buildClient = (
  provider?: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
  signer?: string
): Client => {
  const etherProvider =
    provider ?? new ethers.providers.StaticJsonRpcProvider(config.defaultRPC)
  let ews = new ethers.Contract(
    config.ews.contract,
    EWSAbi,
    etherProvider
  ) as EWS
  let _dc: IDC
  const dc = async (): Promise<IDC> => {
    if (_dc) {
      return _dc
    }
    const dcAddress = await ews.dc()
    _dc = new ethers.Contract(dcAddress, IDCAbi, etherProvider) as IDC
    if (signer) {
      _dc = _dc.connect(signer)
    }
    return _dc
  }
  dc().catch((e) => {
    console.error(e)
  })
  if (signer) {
    ews = ews.connect(signer)
  }
  return {
    ews,
    dc,
    getOwner: async (sld: string) => {
      const c = await dc()
      return await c.ownerOf(sld)
    },
    getExpirationTime: async (sld: string) => {
      const c = await dc()
      const r = await c.nameExpires(sld)
      return r.toNumber() * 1000
    },
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
      return await ews.getLandingPage(
        ethers.utils.id(sld),
        ethers.utils.id(subdomain)
      )
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
