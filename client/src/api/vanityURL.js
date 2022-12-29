import Contract from 'web3-eth-contract'
import config from '../../config'
import VanityURLABI from '../../abi/vanityURL.json'
import Constants from '../constants'
import BN from 'bn.js'
import Web3 from 'web3'


const vanityURLAmount = '1000000000000000000'


export const getURL = async (pageName, alias) => {
  const web3 = new Web3(config.defaultRPC)
  Contract.setProvider(web3.currentProvider)
  const contract = new Contract(VanityURLABI.abi, config.contractVanityURL)
  const res = await contract.methods.getURL(pageName, alias).call()

  return res
}

export const setNewURL = async (connector, address, pageName, alias, url) => {
  const provider = await connector.getProvider()
  const web3 = new Web3(provider)

  Contract.setProvider(web3.currentProvider)
  const contract = new Contract(VanityURLABI.abi, config.contractVanityURL)
  const res = await contract.methods.setNewURL(pageName, alias, url).send({from: address, value: vanityURLAmount})

  return res
}


export const deleteURL = async (connector, address, pageName, alias) => {
  const provider = await connector.getProvider()
  const web3 = new Web3(provider)

  Contract.setProvider(web3.currentProvider)
  const contract = new Contract(VanityURLABI.abi, config.contractVanityURL)
  const res = await contract.methods.deleteURL(pageName, alias).send({from: address})

  return res
}

export const updateURL = async (connector, address, pageName, alias, url) => {
  const provider = await connector.getProvider()
  const web3 = new Web3(provider)

  Contract.setProvider(web3.currentProvider)
  const contract = new Contract(VanityURLABI.abi, config.contractVanityURL)
  const res = await contract.methods.updateURL(pageName, alias, url).send({from: address})

  return res
}
