import { calculatePrice, calculateVRGDAPriceForAmount, findVRGDAPDA, TokenAmountUtils } from './utils'

export type {
  VRGDAInitParams,
  VRGDABuyParams,
  VRGDAInfo,
  VRGDATransactionResult,
  VRGDAInitResult,
  VRGDAPaginationOptions,
  VRGDAPaginatedResult,
  VRGDAPriceCalculationParams,
  TokenData
} from './types'

export {
  VRGDA_PROGRAM_ID,
  DECIMAL,
  WSOL_MINT,
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
  AUCTION_DURATION_DAYS
} from './constants'

export {
  calculateVRGDAPriceForAmount,
  calculatePrice,
  findVRGDAPDA,
  generateTxUrl,
  validateVRGDAParams,
  TokenAmountUtils,
  validatePagination
} from './utils'

export { VRGDAClient } from './client'

export const VRGDAUtils = {
  findVRGDAPDA,
  calculatePrice,
  calculateVRGDAPriceForAmount,
  TokenAmountUtils
}
