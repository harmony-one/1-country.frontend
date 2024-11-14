import axios from 'axios'
import { ethers } from 'ethers'
import { Contract } from 'ethers'
import { defaultProvider } from '../defaultProvider'
import {
  TokenMetadata,
  CreateTokenForm,
  Token,
  TokenBalance,
  TokenTrade,
  TokenWinner,
} from './types'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { CallbackProps, SendProps, SendResult } from '../index'
import TokenFactoryABI from '../../../contracts/abi/TokenFactoryABI'
import config from '../../../config'

export type TokenApiClient = ReturnType<typeof buildTokenApiClient>

export const buildTokenApiClient = ({
  provider,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
}) => {
  const httpClient = axios.create({
    baseURL: config.pumpfun.apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const contractReadOnly = new Contract(
    config.pumpfun.tokenFactoryAddress,
    TokenFactoryABI,
    defaultProvider
  )

  const contract = contractReadOnly.connect(provider.getSigner())

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

  const tokenApiClient = {
    contract,
    // HTTP Methods
    addTokenMetadata: async (payload: TokenMetadata): Promise<string> => {
      try {
        const { data } = await httpClient.post<string>('/metadata', payload)
        return data
      } catch (error) {
        console.error('Failed to upload metadata:', error)
        throw error
      }
    },

    getTokenMetadata: async (
      tokenAddress: string
    ): Promise<TokenMetadata | null> => {
      try {
        const { data } = await httpClient.get<TokenMetadata>(
          `/metadata/${tokenAddress}`
        )
        return data
      } catch (error) {
        console.error('Failed to get metadata:', error)
        return null
      }
    },
    getTokens: async (
      params: {
        search?: string
        limit?: number
        offset?: number
      } = {}
    ): Promise<Token[]> => {
      try {
        const { data } = await httpClient.get<Token[]>('/tokens', { params })
        return data
      } catch (error) {
        console.error('Failed to get tokens', { error, params })
        return []
      }
    },

    getTokenBalances: async (params: {
      tokenAddress?: string
      userAddress?: string // returns token hold by userAddress
      limit?: number
      offset?: number
    }): Promise<TokenBalance[]> => {
      try {
        const { limit = 100, offset = 0 } = params
        const { data } = await httpClient.get<TokenBalance[]>(
          '/token/balances',
          {
            params: {
              ...params,
              offset,
              limit,
            },
          }
        )
        return data
      } catch (error) {
        console.error('Failed to get token balances', { error, params })
        return []
      }
    },

    getUserCreatedTokens: async (userAddress: string): Promise<Token[]> => {
      try {
        const { data } = await httpClient.get<Token[]>(
          `/user/${userAddress}/tokens/created`
        )
        return data
      } catch (error) {
        console.error('Failed to get user created tokens', {
          error,
          userAddress,
        })
        return []
      }
    },

    getTokenWinners: async (
      params: {
        limit?: number
        offset?: number
      } = {}
    ): Promise<TokenWinner[]> => {
      try {
        const { data } = await httpClient.get('/token/winners', { params })
        return data
      } catch (error) {
        console.error('Failed to get token winners', { error, params })
        return []
      }
    },
    getTokenByAddress: async (tokenAddress: string): Promise<Token> => {
      try {
        const { data } = await httpClient.get<Token>(`/token/${tokenAddress}`)
        return data
      } catch (error) {
        console.error('Failed to get token', { error, tokenAddress })
        throw error
      }
    },
    // Web3 Methods
    createToken: async ({
      name,
      symbol,
      metadataUrl,
      onSuccess,
      onFailed,
      onTransactionHash,
    }: {
      name: string
      symbol: string
      metadataUrl: string
    } & CallbackProps) => {
      return send({
        onFailed,
        onSuccess,
        onTransactionHash,
        methodName: 'createToken',
        parameters: [name, symbol, metadataUrl],
      })
    },

    // Composite Methods
    createTokenWithMetadata: async ({
      formData,
      userAddress,
      onSuccess,
      onFailed,
      onTransactionHash,
    }: {
      formData: CreateTokenForm
      userAddress: string
    } & CallbackProps) => {
      try {
        // First upload metadata
        const metadataUrl = await tokenApiClient.addTokenMetadata({
          userAddress,
          ...formData,
        })

        // Then create token
        return await tokenApiClient.createToken({
          name: formData.name,
          symbol: formData.symbol,
          metadataUrl,
          onSuccess,
          onFailed,
          onTransactionHash,
        })
      } catch (error) {
        onFailed && onFailed(error, true)
        throw error
      }
    },
  }

  return tokenApiClient
}
