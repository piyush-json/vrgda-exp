import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { InfoIcon, AlertTriangleIcon } from 'lucide-react'

interface AuctionStatusProps {
  isAuctionActive: boolean
}

export function AuctionStatus({ isAuctionActive }: AuctionStatusProps) {
  if (isAuctionActive) {
    return (
      <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
        <InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500' />
        <AlertTitle className='text-blue-800 dark:text-blue-500'>
          Active Auction
        </AlertTitle>
        <AlertDescription className='text-blue-700 dark:text-blue-400'>
          This token is currently being distributed through a VRGDA auction. Price decreases over time until all tokens are sold.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className='bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'>
      <AlertTriangleIcon className='h-4 w-4 text-gray-600 dark:text-gray-500' />
      <AlertTitle className='text-gray-800 dark:text-gray-500'>
        Auction Ended
      </AlertTitle>
      <AlertDescription className='text-gray-700 dark:text-gray-400'>
        The VRGDA auction for this token has ended. No more tokens can be purchased.
      </AlertDescription>
    </Alert>
  )
}
