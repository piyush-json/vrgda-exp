import { Progress } from '~/components/ui/progress'

interface AuctionProgressProps {
  mintInfo: any
}

export function AuctionProgress({ mintInfo }: AuctionProgressProps) {
  const progressPercentage = (mintInfo.tokensSold / mintInfo.totalSupply) * 100

  return (
    <div>
      <h3 className='text-sm font-medium mb-2'>Auction Progress</h3>
      <Progress
        value={progressPercentage}
        className='h-2 mb-1'
      />
      <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
        <span>0%</span>
        <span>{progressPercentage.toFixed(1)}% sold</span>
        <span>100%</span>
      </div>
    </div>
  )
}
