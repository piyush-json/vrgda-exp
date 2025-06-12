import { PublicKey } from '@solana/web3.js'

export const VRGDA_PROGRAM_ID = new PublicKey(
  '9rUZoTzHGK7SJ9jfAzVLaYW9uMv1YkA6pQcby1tFGRZb'
)

export const DECIMAL = 1_000_000 // 6 decimals for VRGDA tokens

export const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112")

export const DEFAULT_PAGINATION_LIMIT = 30
export const MAX_PAGINATION_LIMIT = 100
export const AUCTION_DURATION_DAYS = 7
