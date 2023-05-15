import { ethers } from 'ethers'
import { EAS } from './easTypes'
import EASAbi from '../../../abi/EAS'
import { Contract } from 'ethers'
import { defaultProvider } from '../defaultProvider'
import config from '../../../config'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { CallbackProps, SendProps, SendResult } from '../index'

export type EasClient = ReturnType<typeof buildEasClient>

export const buildEasClient = ({
  provider,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
}) => {
  const contractReadOnly = new Contract(
    config.eas.contract,
    EASAbi,
    defaultProvider
  ) as unknown as EAS

  const contract = contractReadOnly.connect(provider.getSigner())

  const send = async ({
    amount,
    onFailed,
    onTransactionHash = () => {},
    onSuccess,
    methodName,
    parameters,
  }: SendProps): Promise<SendResult> => {
    try {
      // @ts-expect-error
      const txResponse = (await contract[methodName](...parameters, {
        value: amount,
      })) as TransactionResponse

      onTransactionHash(txResponse.hash)

      if (config.debug) {
        console.log(methodName, JSON.stringify(txResponse))
      }

      const txReceipt = await txResponse.wait()
      onSuccess && onSuccess(txReceipt)
      return { txReceipt: txReceipt, error: null }
    } catch (ex) {
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    contract,
    getSeparator: async (): Promise<string> => {
      return contractReadOnly.SEPARATOR()
    },
    getPublicAliases: (sld: string): Promise<string[]> => {
      return contractReadOnly.getPublicAliases(ethers.utils.id(sld))
    },
    setPublicAliases: async ({
      domainName,
      aliases,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: {
      domainName: string
      aliases: string[]
    } & CallbackProps) => {
      return send({
        onFailed,
        onSuccess,
        onTransactionHash,
        methodName: 'setPublicAliases',
        parameters: [domainName, aliases],
      })
    },

    maxNumAlias: async (): Promise<number> => {
      const r = await contractReadOnly.maxNumAlias()
      return r.toNumber()
    },

    getNumAlias: async (domainName: string): Promise<number> => {
      const r = await contractReadOnly.getNumAlias(ethers.utils.id(domainName))
      return r.toNumber()
    },
    isAliasInUse: async (
      domainName: string,
      alias: string
    ): Promise<boolean> => {
      const c = await contractReadOnly.getCommitment(
        ethers.utils.id(domainName),
        ethers.utils.id(alias)
      )
      return !ethers.BigNumber.from(c).eq(0)
    },
    activate: async ({
      domainName,
      alias,
      commitment,
      makePublic,
      onSuccess,
      onFailed,
      onTransactionHash,
    }: {
      domainName: string
      alias: string
      commitment: string
      makePublic: boolean
    } & CallbackProps) => {
      return send({
        onFailed,
        onSuccess,
        onTransactionHash,
        methodName: 'activate',
        parameters: [
          domainName,
          ethers.utils.id(alias),
          commitment,
          makePublic ? alias : '',
        ],
      })
    },
    deactivate: async ({
      domainName,
      alias,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: {
      domainName: string
      alias: string
    } & CallbackProps) => {
      return send({
        onFailed,
        onSuccess,
        onTransactionHash,
        methodName: 'deactivate',
        parameters: [domainName, ethers.utils.id(alias)],
      })
    },
    deactivateAll: async ({
      domainName,
      onTransactionHash,
      onSuccess,
      onFailed,
    }: { domainName: string } & CallbackProps) => {
      return send({
        onFailed,
        onSuccess,
        onTransactionHash,
        methodName: 'deactivateAll',
        parameters: [domainName],
      })
    },
    buildSignature: async (
      domainName: string,
      alias: string,
      forward: string
    ): Promise<string> => {
      const msg = config.eas.message(domainName, alias, forward)
      console.log('### msg', msg)
      return await contract.signer.signMessage(msg)
    },
  }
}
