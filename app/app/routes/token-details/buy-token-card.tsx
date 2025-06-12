import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { AlertTriangleIcon, ShoppingCartIcon, TrendingDownIcon } from 'lucide-react'
import { useVRGDA } from '~/hooks/use-vrgda'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface BuyTokenCardProps {
  tokenInfo: VRGDAInfo
  buyAmount: string
  setBuyAmount: (amount: string) => void
  onBuyClick: () => void
}

export function BuyTokenCard({
  tokenInfo,
  buyAmount,
  setBuyAmount,
  onBuyClick
}: BuyTokenCardProps) {
  const { calculatePrice } = useVRGDA()

  const formatNumber = (num: number, decimals: number = 6) => {
    if (num == 0) return 0
    if (num < 0.000001) return num.toExponential(2)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const formatSOL = (value: number) => {
    if (value == 0) return '0'
    if (value < 0.0001) return value.toFixed(9)
    if (value < 0.01) return value.toFixed(6)
    if (value < 1) return value.toFixed(4)
    return value.toFixed(2)
  }

  // Calculate total cost for the purchase
  const tokenAmount = parseInt(buyAmount) || 0
  const maxPurchase = Math.min(tokenInfo.totalSupply - tokenInfo.tokensSold, 1000)

  const totalCost = tokenAmount > 0 ? Array.from({ length: tokenAmount }, (_, i) => {
    return calculatePrice({
      timePassed: 0,
      tokensSold: tokenInfo.tokensSold + i,
      targetPrice: tokenInfo.targetPrice,
      decayConstant: tokenInfo.decayConstant,
      r: tokenInfo.r,
      reservePrice: tokenInfo.reservePrice
    })
  }).reduce((sum, price) => sum + price, 0) : 0

  if (!tokenInfo.isAuctionActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Purchase Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangleIcon className='h-4 w-4' />
            <AlertDescription>
              This VRGDA auction is currently inactive. No tokens can be purchased at this time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Purchase Tokens
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <TrendingDownIcon className="h-3 w-3" />
            Live Pricing
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              <strong>Current price:</strong> {formatSOL(tokenInfo.currentPrice)} SOL per token
              <br />
              <span className="text-xs">Price decreases over time in VRGDA auctions</span>
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <Label htmlFor='buyAmount' className="flex items-center justify-between">
              <span>Number of Tokens</span>
              <span className="text-xs text-muted-foreground">
                Max: {formatNumber(maxPurchase, 0)}
              </span>
            </Label>
            <Input
              id='buyAmount'
              type='number'
              placeholder='Enter amount'
              value={buyAmount}
              min={1}
              max={maxPurchase}
              onChange={(e) => setBuyAmount(e.target.value)}
            />
          </div>

          <div className='bg-muted/50 p-4 rounded-lg border'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Quantity:</span>
                <span className='font-medium'>
                  {formatNumber(tokenAmount, 0)} {tokenInfo.metadata?.symbol || 'tokens'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Average Price:</span>
                <span className='font-medium'>
                  {tokenAmount > 0 ? formatSOL(totalCost / tokenAmount) : '0'} SOL
                </span>
              </div>
              <Separator />
              <div className='flex justify-between font-medium'>
                <span>Total Cost:</span>
                <span className="text-lg">
                  {formatSOL(totalCost)} SOL
                </span>
              </div>
            </div>
          </div>

          <Button
            className='w-full'
            size="lg"
            onClick={onBuyClick}
            disabled={!buyAmount || tokenAmount <= 0 || tokenAmount > maxPurchase}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            Buy {tokenAmount > 0 ? formatNumber(tokenAmount, 0) : ''} Tokens
          </Button>

          <p className='text-xs text-muted-foreground text-center'>
            VRGDA pricing adjusts automatically based on time and demand.
            <br />
            Earlier purchases may get better prices.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
