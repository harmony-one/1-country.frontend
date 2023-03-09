import { Contract } from "web3-eth-contract";
import Web3 from 'web3'
import BN from 'bn.js'
import { DCParams } from "./index";

const commonApi = (contract: Contract, tweetContract: Contract) => {
  return {
    getParameters: async (): Promise<DCParams> => {
      const [baseRentalPrice, duration] = await Promise.all([
        tweetContract.methods.baseRentalPrice().call(),
        contract.methods.duration().call(),
      ])
      return {
        baseRentalPrice: {
          amount: new BN(baseRentalPrice).toString(),
          formatted: Web3.utils.fromWei(baseRentalPrice),
        },
        duration: new BN(duration).toNumber() * 1000,
      }
    },
  }
}

export type CommonClient = ReturnType<typeof commonApi>
export default commonApi
