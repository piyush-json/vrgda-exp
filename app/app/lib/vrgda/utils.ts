import { PublicKey } from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { VRGDA_PROGRAM_ID, DECIMAL } from './constants'
import type { VRGDAPriceCalculationParams } from './types'

/**
 * Calculate VRGDA price for amount using geometric series (matches Rust implementation)
 * Follows the exact logic from vrgda_price_for_amount in state.rs
 */
export function calculateVRGDAPriceForAmount(
  timePassed: number,
  sold: number,
  amount: number,
  targetPrice: number,
  decayConstant: number,
  r: number
): number {
  console.log('Input params:', { timePassed, sold, amount, targetPrice, decayConstant, r })

  // 1) elapsed_wad = timePassed (already in seconds)
  const elapsedWad = timePassed
  console.log('ELAPSED TIME:', elapsedWad)

  // 2) target time calculation - matches Rust logic
  let fInvWad: number
  if (sold === 0) {
    const n = Math.min(amount, r)
    fInvWad = n / r  // get_target_sale_time_precise logic
  } else {
    fInvWad = (sold + 1) / r  // get_target_sale_time_precise(scaled_sold + 1)
  }
  console.log('f_inv_wad:', fInvWad)

  // 3) normalized (t − S/r) = (elapsed_wad − f_inv_wad)
  const tMinusSr = elapsedWad - fInvWad
  console.log('t_minus_sr:', tMinusSr)

  const kWad = decayConstant
  console.log('k_wad:', kWad)

  const oneMinusK = 1 - kWad
  console.log('one_minus_k:', oneMinusK)

  const ln1k = Math.log(oneMinusK)
  if (ln1k >= 0) {
    throw new Error('LogError: ln(1-k) must be negative')
  }
  console.log('ln1k:', ln1k)

  const p0 = targetPrice
  console.log('p0:', p0)

  const rawExp = ln1k * tMinusSr
  console.log('RAW EXPONENT:', rawExp)

  const nextMul = Math.exp(rawExp)
  console.log('next_mul:', nextMul)

  const pS1 = p0 * nextMul
  console.log('p_s1:', pS1)

  // 8) geometric ratio q = (1−k)^(−1/r)
  const invR = 1 / r
  console.log('inv_r:', invR)

  const negLn1k = -ln1k
  console.log('neg_ln1k:', negLn1k)

  const q = Math.exp(negLn1k * invR)
  console.log('q:', q)

  const amountPrecise = amount
  console.log('amount_precise:', amountPrecise)

  // 9) sum of m terms: p_s1 * (q^m - 1) / (q - 1)
  const qPowM = Math.pow(q, amountPrecise)
  console.log('Q_POW_M:', qPowM)

  const numerator = pS1 * (qPowM - 1)
  const denom = q - 1
  const totalCost = numerator / denom
  console.log('total_cost:', totalCost)

  return Math.max(totalCost / 10e9, 0)
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

const METADATA_UPLOAD_URI = import.meta.env.VITE_METADATA_UPLOAD_URI

/**
 * Convert file to base64 data URL
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload token metadata to URI service
 */
export const uploadTokenMetadata = async (metadata: {
  name: string
  symbol: string
  description: string
  decimals: number
  image?: string
}): Promise<string> => {
  try {
    const response = await fetch(METADATA_UPLOAD_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload metadata')
    }

    const result = await response.json()
    const uri = result.uri
    if (!uri) {
      throw new Error('No URI returned from metadata upload')
    }
    return result.uri
  } catch (error) {
    console.error('Metadata upload error:', error)
    throw new Error(`Metadata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
