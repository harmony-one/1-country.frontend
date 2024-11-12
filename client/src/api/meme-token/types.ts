// types.ts
export interface TokenMetadata {
  userAddress: string
  name: string
  symbol: string
  description: string
  image: string
}

export interface CreateTokenForm {
  name: string
  symbol: string
  description: string
  image: string
}

export interface Token {
  address: string
  name: string
  symbol: string
  metadata?: TokenMetadata
  createdAt: string
  creatorAddress: string
}

export interface TokenMetadata {
  userAddress: string
  name: string
  symbol: string
  description: string
  image: string
}

export interface Token {
  address: string
  name: string
  symbol: string
  metadata?: TokenMetadata
  createdAt: string
  creatorAddress: string
}

export interface TokenBalance {
  tokenAddress: string
  userAddress: string
  balance: string
  updatedAt: string
}

export interface TokenTrade {
  id: number
  tokenAddress: string
  userAddress: string
  amount: string
  price: string
  type: 'buy' | 'sell'
  timestamp: string
}
