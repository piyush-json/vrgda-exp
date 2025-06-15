import { PublicKey } from '@solana/web3.js'

export const VRGDA_PROGRAM_ID = new PublicKey(
  '4JfrrwUKvDRaM5DZFsuKE1uMD591KhSGGq3wq75JGwP5'
)

export const DECIMAL = 1_000_000 // 6 decimals for VRGDA tokens

export const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112")

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const DEFAULT_PAGINATION_LIMIT = 30
export const MAX_PAGINATION_LIMIT = 100
export const AUCTION_DURATION_DAYS = 7
