import Contract from 'web3-eth-contract'
import config from '../../config'
const apis = ({ web3, address }) => {
  if (!web3) {
    return
  }
  Contract.setProvider(web3.currentProvider)
  return {
    address,
    web3,
    getExplorerUri: (txHash) => {
      return config.explorer.replace('{{txId}}', txHash)
    },
    purchase: ({ amount }) => {
      return amount
    }
  }
}
if (window) {
  window.apis = apis
}
export default apis
