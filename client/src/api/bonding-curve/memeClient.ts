import { ethers } from 'ethers'
import { Contract } from 'ethers'
import { defaultProvider } from '../defaultProvider'

interface TokenContractCache {
  [tokenAddress: string]: Contract
}

export const MemeCoinClient = ({
  provider,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
}) => {
  const tokenContracts: TokenContractCache = {}

  const getTokenContract = (tokenAddress: string): Contract => {
    if (!tokenContracts[tokenAddress]) {
      tokenContracts[tokenAddress] = new Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        defaultProvider
      )
    }
    return tokenContracts[tokenAddress]
  }

  return {
    getBalance: async (
      tokenAddress: string,
      walletAddress: string
    ): Promise<bigint> => {
      try {
        const tokenContract = getTokenContract(tokenAddress)
        return await tokenContract.balanceOf(walletAddress)
      } catch (error) {
        console.error('Error getting token balance:', error)
        throw error
      }
    },

    getBalances: async (
      tokenAddresses: string[],
      walletAddress: string
    ): Promise<Record<string, bigint>> => {
      try {
        const balances = await Promise.all(
          tokenAddresses.map(async (tokenAddress) => {
            const tokenContract = getTokenContract(tokenAddress)
            const balance = await tokenContract.balanceOf(walletAddress)
            return [tokenAddress, balance]
          })
        )
        return Object.fromEntries(balances)
      } catch (error) {
        console.error('Error getting token balances:', error)
        throw error
      }
    },
  }
}
