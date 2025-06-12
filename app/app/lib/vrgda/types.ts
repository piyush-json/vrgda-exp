import { PublicKey, Keypair } from '@solana/web3.js'

export interface VRGDAInitParams {
  mint: Keypair
  targetPrice: number
  decayConstant: number
  r: number
  totalSupply: number
  authority?: PublicKey
  vrgdaStartTimestamp?: number
  wsolMint?: PublicKey
}

export interface VRGDABuyParams {
  amount: number
  vrgdaAddress: string | PublicKey
}

export interface VRGDAInfo {
  vrgdaAddress: string
  mintAddress: string
  authority: string
  totalSupply: number
  tokensSold: number
  remainingSupply: number
  targetPrice: number
  currentPrice: number
  decayConstant: number
  r: number
  startTime: number
  timePassed: number
  vrgdaStartTimestamp: number
  auctionEndTime: number
  isAuctionActive: boolean
  reservePrice: number
  metadata: {
    name: string
    symbol: string
    uri: string
  }
}


export interface VRGDATransactionResult {
  success: boolean
  signature: string
  txUrl: string
}

export interface VRGDAInitResult extends VRGDATransactionResult {
  vrgda: string
  mint: string
  authority: string
}

export interface VRGDABuyResult extends VRGDATransactionResult {
  amount: number
  destination: string
}

export interface VRGDAPaginationOptions {
  page?: number
  limit?: number
}

export interface VRGDAPaginatedResult<T> {
  items: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface VRGDAPriceCalculationParams {
  timePassed: number
  tokensSold: number
  targetPrice: number
  decayConstant: number
  r: number
  reservePrice?: number
}

export type TokenData = VRGDAInfo
