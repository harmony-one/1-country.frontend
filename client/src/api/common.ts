import web3Utils from 'web3-utils'
import { D1DCClient, DCParams } from './index'
import { TweetClient } from './tweetApi'

const commonApi = (dcClient: D1DCClient, tweetClient: TweetClient) => {
  return {
    getParameters: async (): Promise<DCParams> => {
      const [baseRentalPrice, duration] = await Promise.all([
        tweetClient.baseRentalPrice(),
        dcClient.duration(),
      ])

      return {
        baseRentalPrice: {
          amount: baseRentalPrice.toString(),
          formatted: web3Utils.fromWei(baseRentalPrice.toString()),
        },
        duration: duration.toNumber() * 1000,
      }
    },
  }
}

export type CommonClient = ReturnType<typeof commonApi>
export default commonApi
