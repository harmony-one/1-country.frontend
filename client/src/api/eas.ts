import { type ContractTransaction, ethers } from 'ethers'
import axios from 'axios'

import config from '../../config'
import EASAbi from '../../abi/EAS'
import IDCAbi from '../../abi/IDC'
// import { type EAS, type IDC } from '../../contract/typechain-types'

const base = axios.create({ baseURL: config.eas.easServer, timeout: 10000 })

interface APIResponse {
  success?: boolean
  error?: string
}
export const apis = {
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

export interface EasApis {
  eas: any //EAS
  dc: () => Promise<any> //IDC
  getOwner: (sld: string) => Promise<string>
  getExpirationTime: (sld: string) => Promise<number>
  getNumAlias: (sld: string) => Promise<number>
  getPublicAliases: (sld: string) => Promise<string[]>
  activate: (
    sld: string,
    alias: string,
    commitment: string,
    makePublic: boolean
  ) => Promise<ContractTransaction>
  deactivate: (sld: string, alias: string) => Promise<void>
  deactivateAll: (sld: string) => Promise<void>
  buildSignature: (
    sld: string,
    alias: string,
    forward: string
  ) => Promise<string>
  isAliasInUse: (sld: string, alias: string) => Promise<boolean>
}

// Move to index.ts
export const buildClient = (provider?: any, signer?: any): EasApis => {
  const etherProvider =
    provider ?? new ethers.providers.StaticJsonRpcProvider(config.defaultRPC)
  // const etherProvider = new ethers.providers.JsonRpcProvider(config.defaultRpc)
  let eas = new ethers.Contract(
    config.eas.easContract,
    EASAbi,
    etherProvider
  ) as any
  let _dc: any
  const dc = async (): Promise<any> => {
    if (_dc) {
      return _dc
    }
    const dcAddress = await eas.dc()
    _dc = new ethers.Contract(dcAddress, IDCAbi, etherProvider) as any
    if (signer) {
      _dc = _dc.connect(signer)
    }
    return _dc
  }
  dc().catch((e) => {
    console.error(e)
  })

  if (signer) {
    eas = eas.connect(signer)
  }

  return {
    eas,
    dc,
    getOwner: async (sld: string) => {
      const c = await dc()
      const r = await c.nameRecords(ethers.utils.id(sld))
      return r[0]
    },
    getExpirationTime: async (sld: string) => {
      const c = await dc()
      const r = await c.nameRecords(ethers.utils.id(sld))
      return r[2].toNumber() * 1000
    },
    getPublicAliases: async (sld: string) => {
      return await eas.getPublicAliases(ethers.utils.id(sld))
    },
    getNumAlias: async (sld: string) => {
      const r = await eas.getNumAlias(ethers.utils.id(sld))
      return r.toNumber()
    },
    isAliasInUse: async (sld: string, alias: string) => {
      const c = await eas.getCommitment(
        ethers.utils.id(sld),
        ethers.utils.id(alias)
      )
      return !ethers.BigNumber.from(c).eq(0)
    },
    activate: async (
      sld: string,
      alias: string,
      commitment: string,
      makePublic: boolean
    ) => {
      return await eas.activate(
        ethers.utils.id(sld),
        ethers.utils.id(alias),
        commitment,
        makePublic ? alias : ''
      )
    },
    deactivate: async (sld: string, alias: string) => {
      await eas.deactivate(ethers.utils.id(sld), ethers.utils.id(alias))
    },
    deactivateAll: async (sld: string) => {
      await eas.deactivateAll(ethers.utils.id(sld))
    },
    buildSignature: async (sld: string, alias: string, forward: string) => {
      const msg = config.eas.message(sld, alias, forward)
      return await eas.signer.signMessage(msg)
    },
  }
}
