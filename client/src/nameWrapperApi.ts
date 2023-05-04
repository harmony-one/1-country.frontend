import axios from 'axios'
import ERC1155 from '../contracts/abi/ERC1155'
import { utils } from './api/utils'
import config from '../config'

import { Contract } from 'ethers'
import { defaultProvider } from './api/defaultProvider'

const contract = new Contract(
  config.nameWrapperContract,
  ERC1155,
  defaultProvider
)

interface DomainMetaAttr {
  trait_type: string
  display_type?: string
  value: number | string
}

export interface DomainMeta {
  name: string
  description: string
  image: string
  attributes: DomainMetaAttr[]
}

export const nameWrapperApi = {
  loadDomainMeta: async (domainName: string): Promise<DomainMeta | null> => {
    const tokenId = utils.buildTokenId(domainName)
    try {
      const uriMetaData = await contract.uri(tokenId)
      const result = await axios.get<DomainMeta>(uriMetaData)
      return result.data
    } catch (err) {
      return null
    }
  },
}
