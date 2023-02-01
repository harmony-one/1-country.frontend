import config from '../../config'
import D1DCV2 from '../../abi/D1DCV2'
import Constants from '../constants'
import BN from 'bn.js'
import Web3 from "web3";

// console.log('CONTRACT', process.env.CONTRACT)
// console.log('REACT_APP_SMS_WALLET_URL', process.env.REACT_APP_SMS_WALLET_URL)
// console.log('SMSWALLET_CALLBACK_VERIFY', process.env.SMSWALLET_CALLBACK_VERIFY)

export enum EMOJI_TYPE {
  ONE_ABOVE = 0,
  FIRST_PRIZE = 1,
  ONE_HUNDRED_PERCENT = 2
}

export enum OWNER_INFO_FIELDS {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  PHONE = 'phone'
}

interface CallProps {
  amount?: string,
  onFailed?: (error: Error, flag?: boolean) => void,
  onSubmitted?: () => void,
  onSuccess?: (tx: unknown) => void,
  methodName: string,
  parameters: unknown[],
}

interface RentProps extends Pick<CallProps, 'amount' | 'onFailed' | 'onSubmitted' | 'onSuccess' > {
  name: string
  url: string
  telegram: string
  email: string
  phone: string
}

interface UpdateUrlProps extends Pick<CallProps, 'onFailed' | 'onSubmitted' | 'onSuccess'> {
  name: string,
  url: string
}

export const getFullName = (name: string) => {
  return name
  // `${name}${config.tdl}`
}

function objectKeys<T>(obj: T) {
  return Object.keys(obj) as [keyof T];
}

export const getEmojiPrice = (emojiType: EMOJI_TYPE) => {
  const key = objectKeys(config.emojiType).find(key => config.emojiType[key] === emojiType)
  return config.emojiTypePrice[key]
}

const apis = ({ web3, address }: {web3: Web3, address: string}) => {
  console.log('apis', web3, address)
  if (!web3) {
    return
  }

  const contract = new web3.eth.Contract(D1DCV2, config.contract)

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
        const ownerInfo = await contract.methods[getMethod](name).call({ from: address })
        console.log('my ownerInfo', ownerInfo)
        return ownerInfo
      }
      return null
    } catch (e) {
      return null
    }
  }

  const call = async ({ amount, onFailed, onSubmitted, onSuccess, methodName, parameters }: CallProps) => {
    console.log({ methodName, parameters, amount, address })
    try {
      const testTx = await contract.methods[methodName](...parameters).call({ from: address, value: amount })
      if (config.debug) {
        console.log('testTx', methodName, parameters, testTx)
      }
    } catch (ex) {
      const err = ex.toString()
      console.error('testTx Error', err)
      onFailed && onFailed(ex)
      return null
    }
    onSubmitted && onSubmitted()
    try {
      const tx = await contract.methods[methodName](...parameters).send({ from: address, value: amount })
      if (config.debug) {
        console.log(methodName, JSON.stringify(tx))
      }
      console.log(methodName, tx?.events)
      onSuccess && onSuccess(tx)
      return tx
    } catch (ex) {
      onFailed && onFailed(ex, true)
    }
  }

  return {
    address,
    web3,
    getExplorerUri: (txHash: string) => {
      return config.explorer.replace('{{txId}}', txHash)
    },
    call,
    rent: async ({ name, url, telegram, email, phone, amount, onFailed, onSubmitted, onSuccess }: RentProps) => {
      return call({
        amount, parameters: [name, url, telegram, email, phone], methodName: 'rent', onFailed, onSubmitted, onSuccess
      })
    },
    updateURL: async ({ name, url, onFailed, onSubmitted, onSuccess }: UpdateUrlProps) => {
      return call({
        parameters: [name, url], methodName: 'updateURL', onFailed, onSubmitted, onSuccess
      })
    },
    // owner info
    revealInfo: async ({ name, info }: {name: string, info: OWNER_INFO_FIELDS}) => {
      const amount = web3.utils.toWei(new BN(config.infoRevealPrice[info]).toString())
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
            const tx = await contract.methods[revealMethod](name).send({ from: address, value: amount })
            console.log(tx)
            ownerInfo = await contract.methods[getMethod](name).call({ from: address })
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
    getAllOwnerInfo: async ({ name }: {name: string}): Promise<{telegram: string, phone: string, email: string}> => {
      const [telegram, phone, email] = await Promise.all([
        contract.methods.getOwnerTelegram(name).call({ from: address }),
        contract.methods.getOwnerPhone(name).call({ from: address }),
        contract.methods.getOwnerEmail(name).call({ from: address })
      ])
      return {
        telegram,
        phone,
        email
      }
    },
    getParameters: async () => {
      const [baseRentalPrice, rentalPeriod, priceMultiplier, lastRented] = await Promise.all([
        contract.methods.baseRentalPrice().call(),
        contract.methods.rentalPeriod().call(),
        contract.methods.priceMultiplier().call(),
        contract.methods.lastRented().call(),
      ])
      return {
        baseRentalPrice: {
          amount: new BN(baseRentalPrice).toString(),
          formatted: web3.utils.fromWei(baseRentalPrice)
        },
        rentalPeriod: new BN(rentalPeriod).toNumber() * 1000,
        priceMultiplier: new BN(priceMultiplier).toNumber(),
        lastRented,
      }
    },
    getPrice: async ({ name }: {name: string}) => {
      const nameBytes = web3.utils.keccak256(name)
      const price = await contract.methods.getPrice(nameBytes).call({ from: address })
      const amount = new BN(price).toString()
      return {
        amount,
        formatted: web3.utils.fromWei(amount)
      }
    },
    getRecord: async ({ name }: {name: string}) => {
      const nameBytes = web3.utils.keccak256(name)
      const result = await contract.methods.nameRecords(nameBytes).call()
      // console.log('RESULT', result)
      const [renter, timeUpdated, lastPrice, url, prev, next] = Object.keys(result).map(k => result[k])
      return {
        renter: renter === Constants.EmptyAddress ? null : renter,
        lastPrice: {
          amount: lastPrice,
          formatted: web3.utils.fromWei(lastPrice)
        },
        timeUpdated: new BN(timeUpdated).toNumber() * 1000,
        url,
        prev,
        next
      }
    },
    getEmojisCounter: async ({ name }: {name: string}) => {
      const byte32Name = web3.utils.soliditySha3(getFullName(name))
      const [oneAbove, firstPrice, oneHundred] = await Promise.all(
        Object.values(config.emojiType).map(
          emoji => contract.methods.emojiReactionCounters(byte32Name, emoji).call()
        )
      )
      return {
        0: oneAbove,
        1: firstPrice,
        2: oneHundred
      }
    },
    getEmojiCounter: async ({ name, emojiType }: {name: string, emojiType: EMOJI_TYPE}) => {
      const byte32Name = web3.utils.soliditySha3(getFullName(name))
      const emoji = await contract.methods.emojiReactionCounters(byte32Name, emojiType).call()
      return emoji
    },
    addEmojiReaction: async ({ name, emojiType }: {name: string, emojiType: EMOJI_TYPE}) => {
      try {
        const amount = web3.utils.toWei(new BN(getEmojiPrice(emojiType)).toString())
        const tx = await contract.methods.addEmojiReaction(getFullName(name), emojiType).send({ from: address, value: amount })
        console.log('addEmojiReaction TX', tx)
        return tx
      } catch (e) {
        console.log('addEmojiReaction ERROR', e)
        return null
      }
    }
  }
}

if (window) {
  // @ts-expect-error
  window.apis = apis
}

export default apis


export type D1DCClient = ReturnType<typeof apis>
