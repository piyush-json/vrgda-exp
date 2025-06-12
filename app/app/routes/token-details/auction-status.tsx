import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface AuctionStatusProps {
  tokenInfo: VRGDAInfo
}

export function AuctionStatus({ tokenInfo }: AuctionStatusProps) {
  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const remainingTokens = tokenInfo.totalSupply - tokenInfo.tokensSold
  const isCompleted = remainingTokens === 0

  if (isCompleted) {
    return (
      <Alert className='bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'>
        <CheckCircleIcon className='h-4 w-4 text-green-600 dark:text-green-500' />
        <AlertTitle className='text-green-800 dark:text-green-500 flex items-center gap-2'>
          Auction Completed
          <Badge variant="secondary">Sold Out</Badge>
        </AlertTitle>
        <AlertDescription className='text-green-700 dark:text-green-400'>
          All {formatNumber(tokenInfo.totalSupply)} tokens have been sold through the VRGDA auction mechanism.
        </AlertDescription>
      </Alert>
    )
  }

  if (tokenInfo.isAuctionActive) {
    return (
      <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
        <InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500' />
        <AlertTitle className='text-blue-800 dark:text-blue-500 flex items-center gap-2'>
          Active VRGDA Auction
          <Badge variant="default">Live</Badge>
        </AlertTitle>
        <AlertDescription className='text-blue-700 dark:text-blue-400'>
          {formatNumber(remainingTokens)} tokens remaining out of {formatNumber(tokenInfo.totalSupply)} total supply.
          Price adjusts dynamically based on time and demand.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
      <AlertTriangleIcon className='h-4 w-4 text-amber-600 dark:text-amber-500' />
      <AlertTitle className='text-amber-800 dark:text-amber-500 flex items-center gap-2'>
        Auction Paused
        <Badge variant="secondary">Inactive</Badge>
      </AlertTitle>
      <AlertDescription className='text-amber-700 dark:text-amber-400'>
        The VRGDA auction is currently inactive. {formatNumber(remainingTokens)} tokens remain available.
      </AlertDescription>
    </Alert>
  )
}
