import config from '../../config'
import DCAbi from '../../abi/DC'
import Constants from '../constants'
import BN from 'bn.js'
import Web3 from 'web3'
import { utils } from './utils'
import axios from 'axios'
import { TransactionReceipt } from 'web3-core'

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
  lastRented: string // domainName
  duration: number
}

export enum EMOJI_TYPE {
  ONE_ABOVE = 0,
  FIRST_PRIZE = 1,
  ONE_HUNDRED_PERCENT = 2,
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
  url: string
  secret: string
  amount: string
}

interface RenewDomainProps extends CallbackProps {
  name: string
  url: string
  amount: string
}

interface UpdateUrlProps extends CallbackProps {
  name: string
  url: string
}

interface CommitProps extends CallbackProps {
  name: string
  secret: string
}

interface AddUrlProps extends CallbackProps {
  name: string
  url: string
}

interface RemoveUrlProps extends CallbackProps {
  name: string
  pos: number
}

export const getFullName = (name: string) => {
  return name
  // `${name}${config.tdl}`
}

function objectKeys<T>(obj: T) {
  return Object.keys(obj) as [keyof T]
}

export const getEmojiPrice = (emojiType: EMOJI_TYPE) => {
  const key = objectKeys(config.emojiType).find(
    (key) => config.emojiType[key] === emojiType
  )
  return config.emojiTypePrice[key]
}

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
      } = await base.post('/purchase', { domain, txHash, address })
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

const apis = ({ web3, address }: { web3: Web3; address: string }) => {
  // console.log('apis', web3, address)
  if (!web3) {
    return
  }

  const contract = new web3.eth.Contract(DCAbi, config.contract)

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
        const ownerInfo = await contract.methods[getMethod](name).call({
          from: address,
        })
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
    console.log({ methodName, parameters, amount, address })

    try {
      const tx = await contract.methods[methodName](...parameters)
        .send({
          from: address,
          value: amount,
        })
        .on('transactionHash', onTransactionHash)
      if (config.debug) {
        console.log(methodName, JSON.stringify(tx))
      }
      console.log(methodName, tx?.events)
      onSuccess && onSuccess(tx)
      return { txReceipt: tx, error: null }
    } catch (ex) {
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    address,
    contract,
    web3,
    send,
    commit: async ({ name, secret, onFailed, onSuccess }: CommitProps) => {
      const secretHash = utils.keccak256(secret, true)
      const commitment = await contract.methods
        .makeCommitment(name, address, secretHash)
        .call()
      return send({
        onFailed,
        onSuccess,
        methodName: 'commit',
        parameters: [commitment],
      })
    },
    rent: async ({
      name,
      url,
      secret,
      amount,
      onFailed,
      onSuccess,
    }: RentProps) => {
      const secretHash = utils.keccak256(secret, true)
      // console.log({ secretHash })
      return send({
        amount,
        parameters: [name, url, secretHash],
        methodName: 'register',
        onFailed,
        onSuccess,
      })
    },
    updateURL: async ({ name, url, onFailed, onSuccess }: UpdateUrlProps) => {
      return send({
        parameters: [name, url],
        methodName: 'updateURL',
        onFailed,
        onSuccess,
      })
    },
    renewDomain: async ({
      name,
      url,
      amount,
      onFailed,
      onTransactionHash,
      onSuccess,
    }: RenewDomainProps) => {
      return send({
        parameters: [name, url],
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
      const amount = web3.utils.toWei(
        new BN(config.infoRevealPrice[info]).toString()
      )
      console.log('reveal info', name, info, config.infoRevealPrice[info])
      console.log('reveal info address', address)
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
            const { result: tx } = await contract.methods[revealMethod](
              name
            ).send({
              from: address,
              value: amount,
            })
            console.log(tx)
            ownerInfo = await contract.methods[getMethod](name).call({
              from: address,
            })
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
    getAllOwnerInfo: async ({
      name,
    }: {
      name: string
    }): Promise<{ telegram: string; phone: string; email: string }> => {
      const [telegram, phone, email] = await Promise.all([
        contract.methods.getOwnerTelegram(name).call({ from: address }),
        contract.methods.getOwnerPhone(name).call({ from: address }),
        contract.methods.getOwnerEmail(name).call({ from: address }),
      ])
      return {
        telegram,
        phone,
        email,
      }
    },
    getParameters: async (): Promise<DCParams> => {
      const [baseRentalPrice, duration, lastRented] = await Promise.all([
        contract.methods.baseRentalPrice().call(),
        contract.methods.duration().call(),
        contract.methods.lastRented().call(),
      ])
      return {
        baseRentalPrice: {
          amount: new BN(baseRentalPrice).toString(),
          formatted: web3.utils.fromWei(baseRentalPrice),
        },
        duration: new BN(duration).toNumber() * 1000,
        lastRented,
      }
    },
    getPrice: async ({ name }: { name: string }): Promise<DomainPrice> => {
      const price = await contract.methods
        .getPrice(name)
        .call({ from: address })
      const amount = new BN(price).toString()
      return {
        amount,
        formatted: web3.utils.fromWei(amount),
      }
    },
    getRecord: async ({ name }: { name: string }): Promise<DomainRecord> => {
      if (!name) {
        throw new Error('name is empty')
      }
      const nameBytes = web3.utils.keccak256(name)
      const result = await contract.methods.nameRecords(nameBytes).call()
      const [renter, rentTime, expirationTime, lastPrice, url, prev, next] =
        Object.keys(result).map((k) => result[k])
      return {
        renter: renter === Constants.EmptyAddress ? null : renter,
        rentTime: new BN(rentTime).toNumber() * 1000,
        expirationTime: new BN(expirationTime).toNumber() * 1000,
        lastPrice: {
          amount: lastPrice,
          formatted: web3.utils.fromWei(lastPrice),
        },
        url,
        prev,
        next,
      }
    },

    addRecordUrl: ({ name, url, onFailed, onSuccess }: AddUrlProps) => {
      return send({
        parameters: [name, url],
        methodName: 'addURL',
        onFailed,
        onSuccess,
      })
    },

    removeRecordUrl: ({ name, pos, onFailed, onSuccess }: RemoveUrlProps) => {
      return send({
        parameters: [name, pos],
        methodName: 'removeUrl',
        onFailed,
        onSuccess,
      })
    },
    getRecordUrlList: async ({ name }: { name: string }) => {
      return contract.methods.getAllUrls(name).call()
    },

    checkAvailable: async ({ name }: { name: string }) => {
      const isAvailable = await contract.methods.available(name).call()
      return isAvailable?.toString()?.toLowerCase() === 'true'
    },
    getEmojisCounter: async ({ name }: { name: string }) => {
      const byte32Name = web3.utils.soliditySha3(getFullName(name))
      const [oneAbove, firstPrice, oneHundred] = await Promise.all(
        Object.values(config.emojiType).map((emoji) =>
          contract.methods.emojiReactionCounters(byte32Name, emoji).call()
        )
      )
      return {
        0: oneAbove,
        1: firstPrice,
        2: oneHundred,
      }
    },
    getEmojiCounter: async ({
      name,
      emojiType,
    }: {
      name: string
      emojiType: EMOJI_TYPE
    }) => {
      const byte32Name = web3.utils.soliditySha3(getFullName(name))
      const emoji = await contract.methods
        .emojiReactionCounters(byte32Name, emojiType)
        .call()
      return emoji
    },
    addEmojiReaction: async ({
      name,
      emojiType,
    }: {
      name: string
      emojiType: EMOJI_TYPE
    }) => {
      try {
        const amount = web3.utils.toWei(
          new BN(getEmojiPrice(emojiType)).toString()
        )
        const tx = await contract.methods
          .addEmojiReaction(getFullName(name), emojiType)
          .send({ from: address, value: amount })
        console.log('addEmojiReaction TX', tx)
        return tx
      } catch (e) {
        console.log('addEmojiReaction ERROR', e)
        return null
      }
    },
  }
}

if (window) {
  // @ts-expect-error
  window.apis = apis
}

export default apis

export type D1DCClient = ReturnType<typeof apis>
