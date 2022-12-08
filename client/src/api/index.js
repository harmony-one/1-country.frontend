import Contract from 'web3-eth-contract'
import config from '../../config'
import D1DCV2 from '../../abi/D1DCV2.json'
import Constants from '../constants'
import BN from 'bn.js'

export const EmojiType = {
  ONE_ABOVE: 0,
  FIRST_PRIZE: 1,
  ONE_HUNDRED_PERCENT: 2
}

const apis = ({ web3, address }) => {
  if (!web3) {
    return
  }
  Contract.setProvider(web3.currentProvider)
  const contract = new Contract(D1DCV2, config.contract)

  const call = async ({ amount, onFailed, onSubmitted, onSuccess, methodName, parameters }) => {
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
    getExplorerUri: (txHash) => {
      return config.explorer.replace('{{txId}}', txHash)
    },
    call,
    rent: async ({ name, url, telegram, email, phone, amount, onFailed, onSubmitted, onSuccess }) => {
      return call({
        amount, parameters: [name, url, telegram, email, phone], methodName: 'rent', onFailed, onSubmitted, onSuccess
      })
    },
    updateURL: async ({ name, url, onFailed, onSubmitted, onSuccess }) => {
      return call({
        parameters: [name, url], methodName: 'updateURL', onFailed, onSubmitted, onSuccess
      })
    },
    // owner info
    revealInfo: async ({ name, info }) => {
      const amount = new BN(1).toString()
      console.log('reveal info', name, info)
      try {
        const tx = await contract.methods.requestTelegramReveal(name).send({ from: address, value: amount })
        console.log(tx)
        // const telegram = await contract.method.getOwnerTelegram(name).call()
        // console.log('mi telegram', telegram)
        return 'hola' // telegram
      } catch (e) {
        console.log(e)
      }
    },
    getOwnerInfo: async ({ name }) => {
      const [telegram, phone, email] = await Promise.all([
        contract.methods.getOwnerTelegram(name).call({ from: address }),
        contract.methods.getOwnerPhone(name).call({ from: address }),
        contract.methods.getOwnerEmail(name).call({ from: address })
      ])
      console.log('JUAS', telegram)
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
    getPrice: async ({ name }) => {
      const nameBytes = web3.utils.keccak256(name)
      const price = await contract.methods.getPrice(nameBytes).call({ from: address })
      const amount = new BN(price).toString()
      return {
        amount,
        formatted: web3.utils.fromWei(amount)
      }
    },
    getRecord: async ({ name }) => {
      const nameBytes = web3.utils.keccak256(name)
      const result = await contract.methods.nameRecords(nameBytes).call()
      console.log('RESULT', result)
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
    getEmojisCounter: async ({ name }) => {
      const byte32Name = web3.utils.asciiToHex(name)
      const [oneAbove, firstPrice, oneHundred] = await Promise.all([
        contract.methods.emojiReactionCounters(byte32Name, 0).call(),
        contract.methods.emojiReactionCounters(byte32Name, 1).call(),
        contract.methods.emojiReactionCounters(byte32Name, 2).call()
      ])
      return {
        0: oneAbove,
        1: firstPrice,
        2: oneHundred
      }
    },
    getEmojiCounter: async ({ name, emojiType }) => {
      const byte32Name = web3.utils.asciiToHex(name)
      const emoji = await contract.methods.emojiReactionCounters(byte32Name, emojiType).call()
      return emoji
    },
    addEmojiReaction: async ({ name, emojiType }) => {
      const byte32Name = web3.utils.asciiToHex(name)
      const amount = new BN(1).toString()
      console.log('PARAMS', byte32Name, emojiType)
      const tx = await contract.methods.addEmojiReaction(name, emojiType).call({ from: address, value: amount })
      console.log(tx)
    }
  }
}

if (window) {
  window.apis = apis
}

export default apis
