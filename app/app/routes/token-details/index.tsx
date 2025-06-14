import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import {
  LoaderIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  ClockIcon,
  CoinsIcon,
  DollarSignIcon,
  CopyIcon,
  ExternalLinkIcon
} from 'lucide-react'
import { BuyTokenModal } from './buy-token-modal'
import { PriceChart } from './price-chart'
import { useVRGDA } from '~/hooks/use-vrgda'
import { useWallet } from '@solana/wallet-adapter-react'
import type { Route } from './+types'
import type { VRGDAInfo } from '~/lib/vrgda/index'
import { toast } from 'sonner'

export default function TokenDetails({ params }: Route.ComponentProps) {
  const { id: tokenId } = params
  const { getVrgdaInfo, buyTokens, calculatePrice, isLoading: vrgdaLoading } = useVRGDA()
  const { connect, publicKey, connected } = useWallet()

  const [tokenInfo, setTokenInfo] = useState<VRGDAInfo | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [priceData, setPriceData] = useState<Array<{ time: number; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyAmount, setBuyAmount] = useState('')

  // Memoize utility functions to prevent re-creation on every render
  const formatNumber = useCallback((num: number, decimals: number = 6) => {
    if (num === 0) return '0'
    if (num < 0.000001) return num.toExponential(2)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }, [])

  const formatSOL = useCallback((value: number) => {
    if (value == 0) return '0'
    if (value < 0.0001) return value.toFixed(9)
    if (value < 0.01) return value.toFixed(6)
    if (value < 1) return value.toFixed(4)
    return value.toFixed(2)
  }, [formatNumber])

  // Memoize price data generation function
  const generatePriceData = useCallback((info: VRGDAInfo) => {
    const data = []
    const daysToShow = 7 // Show 7 days of price decay

    for (let i = 0; i < daysToShow; i++) {
      const timeElapsed = i * 24 * 60 * 60 // i days in seconds
      const price = calculatePrice({
        timePassed: timeElapsed,
        tokensSold: info.tokensSold,
        targetPrice: info.targetPrice,
        decayConstant: info.decayConstant,
        r: info.r,
        reservePrice: info.reservePrice
      })

      data.push({
        time: i,
        price: Math.max(price, info.reservePrice)
      })
    }
    return data
  }, [calculatePrice])

  // Fetch token data - only depend on tokenId
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!tokenId) return

      try {
        setLoading(true)
        setError(null)

        const info = await getVrgdaInfo(tokenId)
        setTokenInfo(info)
        console.log('Fetched token info:', info)
        // Generate price chart data
        const chartData = generatePriceData(info)
        console.log('Generated price data:', chartData)
        setPriceData(chartData)

      } catch (err) {
        console.error('Error fetching token info:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch token data')
      } finally {
        setLoading(false)
      }
    }

    fetchTokenInfo()
  }, []) // Only essential dependencies

  // Handle token purchase with useCallback
  const handleBuyTokens = useCallback(async (amount: number) => {
    if (!tokenId || !tokenInfo) return

    setBuyStatus('loading')

    try {
      const result = await buyTokens({
        amount,
        vrgdaAddress: tokenId
      })

      if (result?.success) {
        setBuyStatus('success')
        toast.success('Purchase successful!', {
          description: `You have successfully purchased ${formatNumber(amount)} ${tokenInfo.metadata?.symbol || 'tokens'}.`
        })

        // Refresh token info
        const updatedInfo = await getVrgdaInfo(tokenId)
        setTokenInfo(updatedInfo)

        // Update price chart
        const chartData = generatePriceData(updatedInfo)
        setPriceData(chartData)

        setIsBuyModalOpen(false)
      } else {
        setBuyStatus('error')
        toast.error('Purchase failed', {
          description: 'Transaction was not successful'
        })
      }
    } catch (error) {
      console.error('Error buying tokens:', error)
      toast.error('Purchase failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.'
      })
      setBuyStatus('error')
    } finally {
      setTimeout(() => setBuyStatus('idle'), 2000)
    }
  }, [tokenId, tokenInfo, buyTokens, formatNumber, getVrgdaInfo, generatePriceData])

  const handleBuyClick = useCallback(async () => {
    if (!connected) {
      try {
        await connect()
      } catch (err) {
        console.error('Error connecting wallet:', err)
        toast.error('Failed to connect wallet')
        return
      }
    }
    setIsBuyModalOpen(true)
  }, [connected, connect])

  // Add copy functionality
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }, [])

  // Memoize computed values
  const computedValues = useMemo(() => {
    if (!tokenInfo) return null

    return {
      progressPercentage: (tokenInfo.tokensSold / tokenInfo.totalSupply) * 100,
      timeElapsed: Math.floor((Date.now() / 1000) - tokenInfo.startTime),
      isActive: tokenInfo.isAuctionActive
    }
  }, [tokenInfo])

  // Loading state - only for initial token fetch, not buy operations
  if (loading || vrgdaLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !tokenInfo || !computedValues) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangleIcon className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Token Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              {error || 'This token does not exist or is not a valid VRGDA token.'}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { progressPercentage, timeElapsed, isActive } = computedValues

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3 space-y-6">
          {/* Token Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    {tokenInfo.metadata?.uri ? (
                      <img
                        src={tokenInfo.metadata.uri}
                        alt={tokenInfo.metadata?.name || tokenInfo.metadata?.symbol || 'Token'}
                        className='w-16 h-16 rounded-full object-cover'
                      />
                    ) : (
                      <CoinsIcon className="w-8 h-8 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {tokenInfo.metadata?.name || 'Unknown Token'}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {tokenInfo.metadata?.symbol || 'UNK'} • VRGDA Token
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(tokenId, 'Token address')}
                      >
                        <CopyIcon className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://explorer.solana.com/address/${tokenId}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLinkIcon className="h-3 w-3 mr-1" />
                          Explorer
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSignIcon className="w-4 h-4" />
                    Current Price
                  </p>
                  <p className="text-lg font-bold">
                    {formatSOL(tokenInfo.currentPrice)} SOL
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUpIcon className="w-4 h-4" />
                    Target Price
                  </p>
                  <p className="text-lg font-bold">
                    {formatSOL(tokenInfo.targetPrice)} SOL
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CoinsIcon className="w-4 h-4" />
                    Tokens Sold
                  </p>
                  <p className="text-lg font-bold">
                    {formatNumber(tokenInfo.tokensSold, 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Time Elapsed
                  </p>
                  <p className="text-lg font-bold">
                    {Math.floor(timeElapsed / 86400)}d {Math.floor((timeElapsed % 86400) / 3600)}h
                  </p>
                </div>
              </div>

              <Separator />

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sale Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatNumber(tokenInfo.tokensSold, 0)} sold</span>
                  <span>{formatNumber(tokenInfo.totalSupply, 0)} total</span>
                </div>
              </div>

              <Separator />

              {/* Price Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Price Decay Curve</h3>
                {priceData.length > 0 && <PriceChart auctionData={priceData} />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          {/* Token Info */}
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {tokenId.slice(0, 8)}...{tokenId.slice(-8)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tokenId, 'Contract address')}
                      className="h-6 w-6 p-0"
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mint</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {tokenInfo.mintAddress.slice(0, 8)}...{tokenInfo.mintAddress.slice(-8)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tokenInfo.mintAddress, 'Contract address')}
                      className="h-6 w-6 p-0"
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
                      <a
                        href={`https://explorer.solana.com/address/${tokenInfo.mintAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View in Solana Explorer"
                      >
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span>{formatNumber(tokenInfo.totalSupply, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserve Price</span>
                  <span>{formatSOL(tokenInfo.reservePrice)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decay Rate</span>
                  <span>{tokenInfo.decayConstant.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">R Parameter</span>
                  <span>{tokenInfo.r.toFixed(4)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buy Card */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              {isActive ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Current price: <strong>{formatSOL(tokenInfo.currentPrice)} SOL</strong> per token
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleBuyClick}
                    className="w-full"
                    size="lg"
                    disabled={false} // Remove buyStatus dependency here
                  >
                    {connected ? 'Buy Tokens' : 'Connect Wallet to Buy'}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <AlertTriangleIcon className="w-4 h-4" />
                  <AlertDescription>
                    This auction is currently inactive.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Buy Modal - Loading state is handled inside the modal */}
      <BuyTokenModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        tokenName={tokenInfo.metadata?.name || tokenInfo.metadata?.symbol || 'Unknown'}
        tokenSymbol={tokenInfo.metadata?.symbol || 'UNK'}
        tokenLogo={tokenInfo.metadata?.uri || '/default-token-logo.png'}
        currentPrice={tokenInfo.currentPrice / 1e9}
        buyAmount={buyAmount}
        setBuyAmount={setBuyAmount}
        onBuy={handleBuyTokens}
        buyStatus={buyStatus}
        mintAddress={tokenInfo.mintAddress}
        tokenInfo={tokenInfo}
      />
    </div>
  )
}
