import axios from 'axios'
import Web3 from 'web3'
import ERC1155 from '../abi/ERC1155'
import { utils } from './api/utils'
import config from '../config'

const web3 = new Web3(config.defaultRPC)
const contract = new web3.eth.Contract(ERC1155, config.nameWrapperContract)

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
      const uriMetaData = await contract.methods.uri(tokenId).call()
      const result = await axios.get<DomainMeta>(uriMetaData)
      return result.data
    } catch (err) {
      return null
    }
  },
}
