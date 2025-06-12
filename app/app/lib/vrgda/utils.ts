import { PublicKey } from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { VRGDA_PROGRAM_ID, DECIMAL } from './constants'
import type { VRGDAPriceCalculationParams } from './types'

/**
 * Calculate VRGDA price for amount using geometric series (matches Rust implementation)
 * Uses direct power operations instead of exp/ln
 */
export function calculateVRGDAPriceForAmount(
  timePassed: number,
  sold: number,
  amount: number,
  targetPrice: number,
  decayConstant: number,
  r: number
): number {
  // 1) Target sale time for next token: f_inv = (sold + 1) / r
  const nextTokenIndex = sold === 0 ? Math.min(amount, r) : sold + 1
  const targetSaleTime = nextTokenIndex / r

  const timeDeviation = timePassed - targetSaleTime

  const oneMinusK = 1 - decayConstant

  const nextTokenPrice = targetPrice * Math.pow(oneMinusK, timeDeviation)

  const q = Math.pow(oneMinusK, -1 / r)

  if (Math.abs(q - 1) < 1e-10) {
    return amount * nextTokenPrice
  }

  const qPowAmount = Math.pow(q, amount)
  const totalCost = nextTokenPrice * (qPowAmount - 1) / (q - 1)

  return Math.max(totalCost, 0)
}

/**
 * Calculate current VRGDA price for the next token
 */
export function calculatePrice(params: VRGDAPriceCalculationParams): number {
  const { timePassed, tokensSold, targetPrice, decayConstant, r } = params

  const targetSaleTime = (tokensSold + 1) / r
  const timeDeviation = timePassed - targetSaleTime
  const oneMinusK = 1 - decayConstant
  const price = targetPrice * Math.pow(oneMinusK, timeDeviation)

  return Math.max(price, params.reservePrice || 0)
}

/**
 * Find VRGDA Program Derived Address
 */
export function findVRGDAPDA(mint: PublicKey, authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vrgda"), mint.toBuffer(), authority.toBuffer()],
    VRGDA_PROGRAM_ID
  )
}

/**
 * Generate transaction explorer URL
 */
export function generateTxUrl(signature: string, rpcEndpoint: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=localnet&customUrl=${rpcEndpoint}`
}

/**
 * Validate VRGDA initialization parameters
 */
export function validateVRGDAParams(params: {
  decayConstant: number
  r: number
  targetPrice: number
  totalSupply: number
}): void {
  const validations = [
    [params.decayConstant <= 0, 'Decay constant must be greater than 0'],
    [params.r <= 0, 'r must be greater than 0'],
    [params.targetPrice <= 0, 'Target price must be greater than 0'],
    [params.totalSupply <= 0, 'Total supply must be greater than 0'],
    [params.totalSupply > 1e15, 'Total supply must be less than 1e15']
  ]

  for (const [condition, message] of validations) {
    if (condition) throw new Error(message as string)
  }
}

/**
 * Convert token amounts to/from program format
 */
export const TokenAmountUtils = {
  toProgram: (amount: number): number => amount * DECIMAL,
  fromProgram: (amount: number): number => amount / DECIMAL,
  toPriceWad: (price: number): number => Math.floor(price * LAMPORTS_PER_SOL * LAMPORTS_PER_SOL),
  fromPriceWad: (price: number): number => price / (LAMPORTS_PER_SOL * LAMPORTS_PER_SOL),
  toPriceWadBN: (price: number): BN => {
    return new BN(Math.floor(price * LAMPORTS_PER_SOL)).mul(new BN(LAMPORTS_PER_SOL))
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number, maxLimit: number = 100): void {
  if (page < 1) throw new Error('Page must be greater than 0')
  if (limit < 1 || limit > maxLimit) throw new Error(`Limit must be between 1 and ${maxLimit}`)
}
