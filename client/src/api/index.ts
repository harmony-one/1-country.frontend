import config from '../../config'
import DCv2Abi from '../../abi/DCv2'
import Constants from '../constants'
import BN from 'bn.js'
import { Contract, ethers } from 'ethers'
import { utils } from './utils'
import {
  TransactionResponse,
  TransactionReceipt,
} from '@ethersproject/abstract-provider'
import { defaultProvider } from './defaultProvider'
import web3Utils from 'web3-utils'

console.log('CONTRACT', process.env.CONTRACT)

export interface DomainRecord {
  renter: string
  rentTime: number
  lastPrice: {
    amount: string
    formatted: string
  }
  expirationTime: number
  url: string
  prev: string
  next: string
}

export interface DomainPrice {
  amount: string
  formatted: string
}

export interface DCParams {
  baseRentalPrice: DomainPrice
  duration: number
}

export enum OWNER_INFO_FIELDS {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  PHONE = 'phone',
}

export interface CallbackProps {
  onTransactionHash?: (txHash: string) => void
  onFailed?: (error: Error, flag?: boolean) => void
  onSuccess?: (tx: TransactionReceipt) => void
}

export interface SendProps extends CallbackProps {
  amount?: string
  methodName: string
  parameters: unknown[]
}

export interface SendResult {
  txReceipt: TransactionReceipt
  error: Error
}

interface RentProps extends CallbackProps {
  name: string
  owner: string
  secret: string
  amount: string
}

interface RenewDomainProps extends CallbackProps {
  name: string
  url: string
  amount: string
}

interface CommitProps extends CallbackProps {
  name: string
  secret: string
}

const apis = ({
  provider,
  address,
}: {
  provider: ethers.providers.Web3Provider
  address: string
}) => {
  // console.log('apis', web3, address)
  if (!provider) {
    return
  }

  const contractReadOnly = new Contract(
    config.contract,
    DCv2Abi,
    defaultProvider
  )

  const contract = contractReadOnly.connect(provider.getSigner())

  const getOwnerInfo = async (name: string, info: OWNER_INFO_FIELDS) => {
    console.log('getOwnerInfo', name, info, address)
    try {
      if (name) {
        let getMethod = ''
        switch (info) {
          case OWNER_INFO_FIELDS.TELEGRAM:
            getMethod = 'getOwnerTelegram'
            break
          case OWNER_INFO_FIELDS.PHONE:
            getMethod = 'getOwnerPhone'
            break
          case OWNER_INFO_FIELDS.EMAIL:
            getMethod = 'getOwnerEmail'
            break
        }

        const ownerInfo = await contractReadOnly[getMethod]()
        console.log('my ownerInfo', ownerInfo)
        return ownerInfo
      }
      return null
    } catch (e) {
      return null
    }
  }

  const send = async ({
    amount,
    onFailed,
    onTransactionHash = () => {},
    onSuccess,
    methodName,
    parameters,
  }: SendProps): Promise<SendResult> => {
    console.log('send', { methodName, parameters, amount, address })

    try {
      const txResponse = (await contract[methodName](...parameters, {
        value: amount,
      })) as TransactionResponse

      onTransactionHash(txResponse.hash)

      if (config.debug) {
        console.log(methodName, JSON.stringify(txResponse))
      }

      const txReceipt = await txResponse.wait()
      console.log(methodName, txReceipt.events)
      onSuccess && onSuccess(txReceipt)
      return { txReceipt: txReceipt, error: null }
    } catch (ex) {
      console.log('### ex', ex)
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    address,
    contract,
    provider,
    send,
    commit: async ({
      name,
      secret,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: CommitProps) => {
      const secretHash = utils.keccak256(secret, true)
      const commitment = await contractReadOnly.makeCommitment(
        name,
        address,
        secretHash
      )

      return send({
        onFailed,
        onSuccess,
        onTransactionHash,
        methodName: 'commit',
        parameters: [commitment],
      })
    },
    rent: async ({
      name,
      owner,
      secret,
      amount,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: RentProps) => {
      const secretHash = utils.keccak256(secret, true)
      // console.log({ secretHash })
      return send({
        amount,
        parameters: [name, owner, secretHash],
        methodName: 'register',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    renewDomain: async ({
      name,
      amount,
      onFailed,
      onTransactionHash,
      onSuccess,
    }: RenewDomainProps) => {
      return send({
        parameters: [name],
        methodName: 'renew',
        amount,
        onFailed,
        onTransactionHash,
        onSuccess,
      })
    },
    // owner info
    revealInfo: async ({
      name,
      info,
    }: {
      name: string
      info: OWNER_INFO_FIELDS
    }): Promise<string | null> => {
      const amount = web3Utils.toWei(
        new BN(config.infoRevealPrice[info]).toString()
      )
      try {
        if (name) {
          let revealMethod = ''
          let getMethod = ''
          switch (info) {
            case OWNER_INFO_FIELDS.TELEGRAM:
              revealMethod = 'requestTelegramReveal'
              getMethod = 'getOwnerTelegram'
              break
            case OWNER_INFO_FIELDS.PHONE:
              revealMethod = 'requestPhoneReveal'
              getMethod = 'getOwnerPhone'
              break
            case OWNER_INFO_FIELDS.EMAIL:
              revealMethod = 'requestEmailReveal'
              getMethod = 'getOwnerEmail'
              break
          }
          let ownerInfo = await getOwnerInfo(name, info)
          if (!ownerInfo) {
            console.log('case result', info, revealMethod, getMethod)
            const { result: tx } = await contract[revealMethod](name)
            console.log(tx)
            ownerInfo = await contractReadOnly[getMethod](name)
            console.log('my ownerInfo', ownerInfo)
          }
          return ownerInfo
        }
        return null
      } catch (e) {
        console.log(e)
        return null
      }
    },
    duration() {
      return contractReadOnly.duration()
    },
    getPrice: async ({ name }: { name: string }): Promise<DomainPrice> => {
      const price = await contractReadOnly.getPrice(name)

      const amount = price.toString()
      return {
        amount,
        formatted: web3Utils.fromWei(amount),
      }
    },
    getRecord: async ({ name }: { name: string }): Promise<DomainRecord> => {
      if (!name) {
        throw new Error('name is empty')
      }
      // const nameBytes = web3.utils.keccak256(name)

      let lastPrice = '0',
        url = '',
        prev = '',
        next = ''

      const [ownerAddress, rentTime, expirationTime] = await Promise.all([
        contractReadOnly.ownerOf(name).catch(() => ''),
        contractReadOnly.duration(),
        contractReadOnly.nameExpires(name),
      ])
      return {
        renter:
          !ownerAddress || ownerAddress === Constants.EmptyAddress
            ? null
            : ownerAddress,
        rentTime: rentTime.toNumber() * 1000,
        expirationTime: expirationTime.toNumber() * 1000,
        lastPrice: {
          amount: lastPrice,
          formatted: web3Utils.fromWei(lastPrice),
        },
        url,
        prev,
        next,
      }
    },
    ownerOf: async ({ name }: { name: string }) => {
      return contractReadOnly.ownerOf(name)
    },

    checkAvailable: async ({ name }: { name: string }) => {
      const isAvailable = await contractReadOnly.available(name)
      return isAvailable?.toString()?.toLowerCase() === 'true'
    },

    // signMessage: ({ message }: { message: string }) => {
    //   const hashMessage = web3.eth.accounts.hashMessage(
    //     web3.utils.utf8ToHex(message)
    //   )
    //   return web3.eth.sign(hashMessage, address)
    // },
  }
}

if (window) {
  // @ts-expect-error
  window.apis = apis
}

export default apis

export type D1DCClient = ReturnType<typeof apis>
