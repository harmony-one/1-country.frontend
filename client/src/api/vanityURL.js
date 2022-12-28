import Contract from 'web3-eth-contract'
import config from '../../config'
import VanityURLABI from '../../abi/vanityURL.json'
import Constants from '../constants'
import BN from 'bn.js'
import Web3 from 'web3'

const web3 = new Web3(config.defaultRPC)

Contract.setProvider(web3.currentProvider)
const contract = new Contract(VanityURLABI.abi, config.contractVanityURL)

// setNewURL
// getURL
// deleteURL
// updateURL

export const getURL = async (pageName, alias) => {
  console.log('getUrl', pageName, alias)
  const res = await contract.methods.getURL(pageName, alias).call()
  console.log('response',{res})

  return res
}
