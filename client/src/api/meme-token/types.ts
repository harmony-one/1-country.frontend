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

export interface TokenUriData {
  userAddress: string
  name: string
  ticker: string
  description: string
  image: string
}

export interface Token {
  id: string
  txnHash: string
  blockNumber: number
  address: string
  name: string
  symbol: string
  uri: string
  uriData: TokenUriData | null
  totalSupply: string
  price: string
  marketCap: string
  timestamp: string
  createdAt: string
  updatedAt: string
  user: UserAccount | null
}

export interface UserAccount {
  id: string
  address: string
  username: string
  createdAt: string
  updatedAt: string
  tokens: Token[]
}

export interface TokenBalance {
  id: string
  tokenAddress: string
  userAddress: string
  balance: string
  updatedAt: string
  token: Token
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

export interface TokenWinner {
  id: string
  timestamp: string
  txnHash: string
  blockNumber: number
  createdAt: Date
  token: Token
}
