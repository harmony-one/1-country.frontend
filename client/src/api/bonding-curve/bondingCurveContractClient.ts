import { ethers } from 'ethers'
import { Contract } from 'ethers'
import { defaultProvider } from '../defaultProvider'
import config from '../../../config'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { CallbackProps, SendProps, SendResult } from '../index'
import BONDING_CURVE_ABI from '../../../contracts/abi/BondingCurve'
import { TransactionReceipt } from 'viem'
import { MemeCoinClient } from './memeClient'

const STEPS = {
  // Each step represents tokens amount: 1, 10, 100, 1000
  SUPPLIES: [
    ethers.utils.parseUnits('1', 18), // 1 token
    ethers.utils.parseUnits('10', 18), // 10 tokens
    ethers.utils.parseUnits('100', 18), // 100 tokens
    ethers.utils.parseUnits('1000', 18), // 1000 tokens
  ],
  // Prices in ONE token: 10, 20, 40, 80
  PRICES: [
    ethers.utils.parseUnits('10', 18), // 10 ONE
    ethers.utils.parseUnits('20', 18), // 20 ONE
    ethers.utils.parseUnits('40', 18), // 40 ONE
    ethers.utils.parseUnits('80', 18), // 80 ONE
  ],
}

interface CreateTokenResult {
  txReceipt: TransactionReceipt | null
  error: Error | null
  tokenAddress: string | null
}

// Types for the bonding curve responses
export interface TokenInfo {
  name: string
  symbol: string
  tokenAddress: string
}

export interface TokenInfoWithPrice extends TokenInfo {
  currentPrice: string
  totalSupply: string
}

export type BondingCurveClient = ReturnType<typeof buildBondingCurveClient>

export const buildBondingCurveClient = ({
  provider,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
}) => {
  const contractReadOnly = new Contract(
    config.bondingCurve.address,
    BONDING_CURVE_ABI,
    defaultProvider
  )

  const contract = contractReadOnly.connect(provider.getSigner())

  const memeClient = MemeCoinClient({ provider })

  const send = async ({
    amount,
    onFailed,
    onTransactionHash = () => {},
    onSuccess,
    methodName,
    parameters,
  }: SendProps): Promise<SendResult> => {
    try {
      const txResponse = (await contract[methodName](...parameters, {
        value: amount,
      })) as TransactionResponse

      onTransactionHash(txResponse.hash)
      const txReceipt = await txResponse.wait()
      onSuccess && onSuccess(txReceipt)
      return { txReceipt, error: null }
    } catch (ex) {
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    contract,
    isTokenNameTaken: async (name: string): Promise<boolean> => {
      try {
        return await contractReadOnly.isNameTaken(name)
      } catch (error) {
        console.error('Error checking name availability:', error)
        throw error
      }
    },
    tokens: {
      getBalance: async (tokenAddress: string, walletAddress: string) => {
        return await memeClient.getBalance(tokenAddress, walletAddress)
      },
      getBalances: async (tokenAddresses: string[], walletAddress: string) => {
        return await memeClient.getBalances(tokenAddresses, walletAddress)
      },
    },
    createToken: async ({
      name,
      symbol,
      onSuccess,
      onFailed,
      onTransactionHash,
    }: {
      name: string
      symbol: string
    } & CallbackProps): Promise<CreateTokenResult> => {
      try {
        const txResponse = await contract.createToken(
          name,
          symbol,
          STEPS.SUPPLIES,
          STEPS.PRICES
        )
        onTransactionHash && onTransactionHash(txResponse.hash)

        const txReceipt = await txResponse.wait()

        const event = txReceipt.events?.find(
          (e: any) => e.event === 'TokenAdded'
        )
        const newTokenAddress = event?.args ? event.args[0] : null

        onSuccess && onSuccess(txReceipt)
        return { txReceipt, error: null, tokenAddress: newTokenAddress }
      } catch (ex) {
        onFailed && onFailed(ex, true)
        return { txReceipt: null, error: ex, tokenAddress: null }
      }
    },

    getTokensForWallet: async (
      walletAddress: string
    ): Promise<TokenInfoWithPrice[]> => {
      const allTokens = await contractReadOnly.getOwnerTokens(walletAddress)

      return allTokens.map((token: any[]) => ({
        name: token[0],
        symbol: token[1],
        tokenAddress: token[2],
        currentPrice: token[3],
        totalSupply: token[4],
      }))
    },
  }
}
