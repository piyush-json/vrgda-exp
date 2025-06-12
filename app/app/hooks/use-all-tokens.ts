import { useState, useEffect, useCallback } from 'react'
import { useAnchorProvider } from '~/components/solana/solana-provider'
import { VRGDAClient, type VRGDAInfo } from '~/lib/vrgda/index'

// Use VRGDAInfo from SDK for consistency
export type TokenData = VRGDAInfo

const CACHE_KEY = 'vrgda_tokens_cache'
const CACHE_DURATION = 60 * 1000 // 1 min
const DEFAULT_TOKENS_PER_PAGE = 30

interface CacheData {
  tokens: TokenData[]
  timestamp: number
}

export function useAllTokens(tokensPerPage: number = DEFAULT_TOKENS_PER_PAGE) {
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
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return parsedCache.tokens
    } catch (error) {
      console.error('Cache read error:', error)
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  }, [])

  const setCachedData = useCallback((tokens: TokenData[]) => {
    try {
      const cacheData: CacheData = {
        tokens,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Cache write error:', error)
    }
  }, [])

  const updatePaginatedTokens = useCallback((allTokens: TokenData[], page: number) => {
    const startIndex = (page - 1) * tokensPerPage
    const endIndex = startIndex + tokensPerPage
    const paginatedTokens = allTokens.slice(startIndex, endIndex)

    setTokens(paginatedTokens)
    setTotalPages(Math.ceil(allTokens.length / tokensPerPage))
  }, [tokensPerPage])

  const fetchAllTokens = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError('Solana provider not available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const vrgdaClient = VRGDAClient.create(provider)
      const fetchedTokens = await vrgdaClient.getAllVRGDATokens()

      console.log(`Fetched ${fetchedTokens.length} VRGDA tokens`)

      setCachedData(fetchedTokens)
      setAllTokens(fetchedTokens)
      updatePaginatedTokens(fetchedTokens, 1)
      setCurrentPage(1)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tokens'
      console.error('Token fetch error:', error)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [getProvider, setCachedData, updatePaginatedTokens])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      updatePaginatedTokens(allTokens, page)
    }
  }, [allTokens, totalPages, currentPage, updatePaginatedTokens])

  const refreshTokens = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY)
    await fetchAllTokens()
  }, [fetchAllTokens])

  // Initialize data on mount
  useEffect(() => {
    const cachedTokens = getCachedData()

    if (cachedTokens?.length) {
      console.log(`Loaded ${cachedTokens.length} tokens from cache`)
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
    goToPage,
    totalTokens: allTokens.length,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }
}
