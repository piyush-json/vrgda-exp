import { useState, useEffect, useCallback } from 'react'
import { Program } from '@coral-xyz/anchor'
import { useAnchorProvider } from '~/components/solana/solana-provider'
import { IDL } from 'types/new_vrgda'
import { VRGDA_PROGRAM_ID } from './use-vrgda'

export type TokenData = {
  mintAddress: string
  id: string
  r: string
  reservePrice: string
  decayConstant: string
  symbol: string
  totalSupply: string
  auctionDurationDays: string
  startTime: string
  tokensSold: string
}

const CACHE_KEY = 'vrgda_mint_ids_cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
const TOKENS_PER_PAGE = 30

interface CacheData {
  allTokens: TokenData[]
  timestamp: number
}

export function useAllTokens() {
  const [allTokens, setAllTokens] = useState<TokenData[]>([])
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const getProvider = useAnchorProvider()

  const getCachedData = useCallback((): TokenData[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const parsedCache: CacheData = JSON.parse(cached)
      const now = Date.now()

      if (now - parsedCache.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return parsedCache.allTokens
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }, [])

  const setCachedData = useCallback((tokens: TokenData[]) => {
    try {
      const cacheData: CacheData = {
        allTokens: tokens,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }, [])

  const updatePaginatedTokens = useCallback((allTokens: TokenData[], page: number) => {
    const startIndex = (page - 1) * TOKENS_PER_PAGE
    const endIndex = startIndex + TOKENS_PER_PAGE
    const paginatedTokens = allTokens.slice(startIndex, endIndex)

    setTokens(paginatedTokens)
    setTotalPages(Math.ceil(allTokens.length / TOKENS_PER_PAGE))
  }, [])

  const fetchAllTokens = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError('Provider not found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const program = new Program(IDL, VRGDA_PROGRAM_ID, provider)
      const mintStates = await program.account.mintState.all()
      console.log('Fetched mint states:', mintStates)
      const allTokens: TokenData[] = mintStates.map((mintStateAccount, index) => ({
        mintAddress: mintStateAccount.account.mint.toString(),
        r: mintStateAccount.account.r.toString(),
        reservePrice: mintStateAccount.account.reservePrice.toString(),
        decayConstant: mintStateAccount.account.decayConstant.toString(),
        symbol: mintStateAccount.account.symbol,
        totalSupply: mintStateAccount.account.totalSupply.toString(),
        auctionDurationDays: mintStateAccount.account.auctionDurationDays.toString(),
        startTime: mintStateAccount.account.startTime.toString(),
        tokensSold: mintStateAccount.account.tokensSold.toString(),
        id: `${mintStateAccount.publicKey.toString()}-${index}`
      }))

      setCachedData(allTokens)
      setAllTokens(allTokens)
      updatePaginatedTokens(allTokens, 1)
      setCurrentPage(1)

    } catch (error) {
      console.error('Error fetching tokens:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch tokens')
    } finally {
      setIsLoading(false)
    }
  }, [getProvider, setCachedData, updatePaginatedTokens])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      updatePaginatedTokens(allTokens, page)
    }
  }, [allTokens, totalPages, updatePaginatedTokens])

  const refreshTokens = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY)
    await fetchAllTokens()
  }, [fetchAllTokens])

  useEffect(() => {
    const cachedTokens = getCachedData()

    if (cachedTokens && cachedTokens.length > 0) {
      setAllTokens(cachedTokens)
      updatePaginatedTokens(cachedTokens, 1)
      setCurrentPage(1)
    } else {
      fetchAllTokens()
    }
  }, [getCachedData, fetchAllTokens, updatePaginatedTokens])

  return {
    tokens,
    allTokens,
    currentPage,
    totalPages,
    isLoading,
    error,
    refreshTokens,
    fetchAllTokens,
    goToPage
  }
}
