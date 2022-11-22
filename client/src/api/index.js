import Contract from 'web3-eth-contract'
import config from '../../config'
import D1DC from '../../abi/D1DC.json'
import Constants from '../constants'
import BN from 'bn.js'

const apis = ({ web3, address }) => {
  if (!web3) {
    return
  }
  Contract.setProvider(web3.currentProvider)
  const contract = new Contract(D1DC, config.contract)

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
    rent: async ({ name, url, amount, onFailed, onSubmitted, onSuccess }) => {
      return call({
        amount, parameters: [name, url], methodName: 'rent', onFailed, onSubmitted, onSuccess
      })
    },
    updateURL: async ({ name, url, onFailed, onSubmitted, onSuccess }) => {
      return call({
        parameters: [name, url], methodName: 'updateURL', onFailed, onSubmitted, onSuccess
      })
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
      const [renter, timeUpdated, lastPrice, url] = Object.keys(result).map(k => result[k])
      return {
        renter: renter === Constants.EmptyAddress ? null : renter,
        lastPrice: {
          amount: lastPrice,
          formatted: web3.utils.fromWei(lastPrice)
        },
        timeUpdated: new BN(timeUpdated).toNumber() * 1000,
        url
      }
    }
  }
}
if (window) {
  window.apis = apis
}
export default apis
