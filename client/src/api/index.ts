import config from '../../config'
import DCv2Abi from '../../abi/DCv2'
import Constants from '../constants'
import BN from 'bn.js'
import Web3 from 'web3'
import { utils } from './utils'
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

const apis = ({ web3, address }: { web3: Web3; address: string }) => {
  // console.log('apis', web3, address)
  if (!web3) {
    return
  }

  const web3ReadOnly = new Web3(config.defaultRPC)
  const contractReadOnly = new web3ReadOnly.eth.Contract(
    DCv2Abi,
    config.contract,
    { from: address }
  )
  const contract = new web3.eth.Contract(DCv2Abi, config.contract)

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
        const ownerInfo = await contractReadOnly.methods[getMethod](name).call({
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
    commit: async ({
      name,
      secret,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: CommitProps) => {
      const secretHash = utils.keccak256(secret, true)
      const commitment = await contractReadOnly.methods
        .makeCommitment(name, address, secretHash)
        .call()
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
      const amount = web3.utils.toWei(
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
            const { result: tx } = await contract.methods[revealMethod](
              name
            ).send({
              from: address,
              value: amount,
            })
            console.log(tx)
            ownerInfo = await contractReadOnly.methods[getMethod](name).call({
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
    getPrice: async ({ name }: { name: string }): Promise<DomainPrice> => {
      const price = await contractReadOnly.methods
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
      // const nameBytes = web3.utils.keccak256(name)

      let lastPrice = '0',
        url = '',
        prev = '',
        next = ''

      const [ownerAddress, rentTime, expirationTime] = await Promise.all([
        contractReadOnly.methods
          .ownerOf(name)
          .call()
          .catch(() => ''),
        contractReadOnly.methods.duration().call(),
        contractReadOnly.methods.nameExpires(name).call(),
      ])
      return {
        renter:
          !ownerAddress || ownerAddress === Constants.EmptyAddress
            ? null
            : ownerAddress,
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
    ownerOf: async ({ name }: { name: string }) => {
      return contractReadOnly.methods.ownerOf(name).call()
    },

    checkAvailable: async ({ name }: { name: string }) => {
      const isAvailable = await contractReadOnly.methods.available(name).call()
      return isAvailable?.toString()?.toLowerCase() === 'true'
    },
  }
}

if (window) {
  // @ts-expect-error
  window.apis = apis
}

export default apis

export type D1DCClient = ReturnType<typeof apis>
