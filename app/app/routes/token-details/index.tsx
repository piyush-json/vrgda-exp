import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader
} from '~/components/ui/card'
import { LoaderIcon, AlertTriangleIcon } from 'lucide-react'
import { BuyTokenModal } from './buy-token-modal'
import { TokenHeader } from './token-header'
import { AuctionStatus } from './auction-status'
import { TokenMetrics } from './token-metrics'
import { AuctionProgress } from './auction-progress'
import { PriceChart } from './price-chart'
import { TokenInfoCard } from './token-info-card'
import { BuyTokenCard } from './buy-token-card'
import { useVRGDA } from '~/hooks/use-vrgda'
import { useWallet } from '@solana/wallet-adapter-react'
import type { Route } from './+types'
import { toast } from 'sonner'

export type TokenInfo = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  marketCap: number;
  tokenSold: number;
  description: string;
  isAuctionActive: boolean;
  reservePrice: number;
  targetPrice: number;
  currentPrice: number;
  decayConstant: number;
  r: number;
  startTime: number;
  totalSupply: number;
  tokensSold: number;
}

export default function TokenDetails({ params }: Route.ComponentProps) {
  const { id: tokenId } = params
  const { getVrgdaInfo, buyTokens, calculatePrice, isLoading: vrgdaLoading } = useVRGDA()
  const { connect, publicKey } = useWallet()

  const [buyAmount, setBuyAmount] = useState('')
  const [tokenData, setTokenData] = useState<TokenInfo | null>(null)
  const [mintInfo, setMintInfo] = useState<any>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [buyStatus, setBuyStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [auctionData, setAuctionData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatNumber = (num: number, decimals: number = 6) => {
    if (num < 0.000001) return num.toExponential(2)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  useEffect(() => {
    const fetchMintInfo = async () => {
      if (!tokenId) return

      try {
        setLoading(true)
        setError(null)
        const info = await getVrgdaInfo(tokenId)
        setMintInfo(info)
        const convertedTokenData = {
          id: tokenId,
          name: info.metadata?.name || 'Unknown Token',
          symbol: info.metadata?.symbol || 'UNK',
          logo: info.metadata?.uri || '/default-token-logo.png',
          price: info.currentPrice,
          marketCap: info.totalSupply * info.currentPrice,
          tokenSold: info.tokensSold,
          description: `VRGDA auction token with ${info.totalSupply.toLocaleString()} total supply`,
          isAuctionActive: info.isAuctionActive,
          reservePrice: info.reservePrice,
          targetPrice: info.targetPrice,
          currentPrice: info.currentPrice,
          decayConstant: info.decayConstant,
          r: info.r,
          startTime: info.startTime,
          totalSupply: info.totalSupply,
          tokensSold: info.tokensSold
        }
        console.log('Converted token data:', convertedTokenData)
        setTokenData(convertedTokenData)

        const endTime = new Date(info.auctionEndTime * 1000)
        const now = new Date()
        const timeDiff = endTime.getTime() - now.getTime()

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          const data = []
          const targetPrice = info.targetPrice
          const decayConstant = info.decayConstant
          const r = info.r
          for (let i = 0; i <= days; i++) {
            const timeElapsed = i
            const tokensSold = 0

            const price = calculatePrice({
              timePassed: timeElapsed,
              tokensSold,
              targetPrice,
              decayConstant,
              r,
              reservePrice: info.reservePrice
            })

            data.push({
              time: i,
              price: Math.max(price, info.reservePrice)
            })
          }
          setAuctionData(data)
        }
      } catch (err) {
        console.error('Error fetching mint info:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch token data')
      } finally {
        setLoading(false)
      }
    }

    fetchMintInfo()
  }, [tokenId])

  const handleBuyTokens = async (amount: number) => {
    if (!tokenId) return

    setBuyStatus('loading')

    try {
      const result = await buyTokens({
        amount,
        vrgdaAddress: tokenId
      })
      console.log('Buy tokens result:', result)
      if (result && result.success) {
        setBuyStatus('success')
        toast.success('Purchase successful!', {
          description: `You have successfully purchased ${formatNumber(amount)} ${tokenData?.symbol}.`
        })
        const updatedInfo = await getVrgdaInfo(tokenId)
        setMintInfo(updatedInfo)
        setBuyStatus('idle')
        setIsBuyModalOpen(false)
      } else {
        setBuyStatus('error')
        setTimeout(() => setBuyStatus('idle'), 2000)
      }
    } catch (error) {
      console.error('Error buying tokens:', error)
      toast.error('Purchase failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.'
      })
      setBuyStatus('error')
      setTimeout(() => setBuyStatus('idle'), 2000)
    }
  }

  const handleBuyButtonClick = () => {
    if (publicKey) {
      setIsBuyModalOpen(true)
    } else {
      connect().then(() => {
        setIsBuyModalOpen(true)
      }).catch((err) => {
        console.error('Error connecting wallet:', err)
        setError('Failed to connect wallet')
      })
    }
  }

  if (loading || vrgdaLoading) {
    console.log('Loading token details...')
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <LoaderIcon className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    )
  }

  if (error || !tokenData || !mintInfo) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center'>
          <AlertTriangleIcon className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Token Not Found</h2>
          <p className='text-gray-500'>{error || 'This token does not exist or is not a VRGDA token.'}</p>
        </div>
      </div>
    )
  }

  const currentTotalAmount = Array.from({ length: parseInt(buyAmount) || 0 }, (_, i) => i + 1)
    .reduce((total, amount) => total + calculatePrice({
      targetPrice: mintInfo.targetPrice,
      decayConstant: mintInfo.decayConstant,
      r: mintInfo.r,
      timePassed: 0,
      tokensSold: mintInfo.tokensSold + amount,
      reservePrice: mintInfo.reservePrice
    }), 0).toFixed(6)

  return (
    <div className='space-y-8'>
      <div className='flex flex-col md:flex-row md:items-start gap-6'>
        <div className='md:w-2/3 space-y-6'>
          <Card>
            <CardHeader className='pb-2'>
              <TokenHeader tokenId={tokenId!} mintInfo={mintInfo} />
            </CardHeader>

            <CardContent className='space-y-6'>
              <AuctionStatus isAuctionActive={mintInfo.isAuctionActive} />
              <TokenMetrics mintInfo={mintInfo} />
              <AuctionProgress mintInfo={mintInfo} />
              <PriceChart auctionData={auctionData} />
            </CardContent>
          </Card>
        </div>

        <div className='md:w-1/3 space-y-6'>
          <TokenInfoCard mintInfo={mintInfo} tokenId={tokenId!} />
          <BuyTokenCard
            mintInfo={mintInfo}
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            currentTotalAmount={currentTotalAmount}
            onBuyClick={handleBuyButtonClick}
          />
        </div>

        <BuyTokenModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          tokenName={mintInfo.metadata?.name || mintInfo.symbol}
          tokenSymbol={mintInfo.symbol}
          tokenLogo={mintInfo.metadata?.uri || '/default-token-logo.png'}
          currentPrice={mintInfo.currentPrice / 1e9}
          buyAmount={buyAmount}
          setBuyAmount={setBuyAmount}
          onBuy={handleBuyTokens}
          buyStatus={buyStatus}
          mintAddress={tokenId}
          mintInfo={tokenData}
        />
      </div>
    </div>
  )
}
