import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { AlertTriangleIcon } from 'lucide-react'

interface BuyTokenCardProps {
  mintInfo: any
  buyAmount: string
  setBuyAmount: (amount: string) => void
  currentTotalAmount: string
  onBuyClick: () => void
}

export function BuyTokenCard({
  mintInfo,
  buyAmount,
  setBuyAmount,
  currentTotalAmount,
  onBuyClick
}: BuyTokenCardProps) {
  if (!mintInfo.isAuctionActive) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participate in VRGDA Auction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
            <AlertTriangleIcon className='h-4 w-4 text-amber-600 dark:text-amber-500' />
            <AlertTitle className='text-amber-800 dark:text-amber-500'>
              Current Price
            </AlertTitle>
            <AlertDescription className='text-amber-700 dark:text-amber-400'>
              {(mintInfo.currentPrice).toFixed(6)} SOL per token. Price decreases over time until all tokens are sold.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <Label htmlFor='buyAmount'>Amount to Buy</Label>
            <Input
              id='buyAmount'
              type='number'
              placeholder='Enter amount of tokens'
              value={buyAmount}
              min={1}
              max={Math.min(mintInfo.totalSupply - mintInfo.tokensSold, 100)}
              onChange={(e) => setBuyAmount(e.target.value)}
            />
          </div>

          <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
            <div className='flex justify-between mb-2'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Price per Token:
              </span>
              <span className='font-medium'>
                {(mintInfo.currentPrice).toFixed(6)} SOL
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Quantity:
              </span>
              <span className='font-medium'>
                {buyAmount ? parseInt(buyAmount).toLocaleString() : '0'} tokens
              </span>
            </div>
            <Separator className='my-2' />
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>Total Cost:</span>
              <span className='font-bold'>
                {buyAmount ? currentTotalAmount : '0'} SOL
              </span>
            </div>
          </div>

          <Button
            className='w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
            onClick={onBuyClick}
            disabled={!buyAmount || parseInt(buyAmount) <= 0}
          >
            Buy Tokens
          </Button>

          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            VRGDA auctions automatically adjust price based on time and demand.
            <br />
            Buy early for potentially better prices.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
