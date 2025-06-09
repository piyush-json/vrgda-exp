interface TokenMetricsProps {
  mintInfo: any
}

export function TokenMetrics({ mintInfo }: TokenMetricsProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Current Price
        </div>
        <div className='font-bold'>{(mintInfo.currentPrice).toFixed(6)} SOL</div>
      </div>
      <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Tokens Sold
        </div>
        <div className='font-bold'>
          {mintInfo.tokensSold.toLocaleString()} / {mintInfo.totalSupply.toLocaleString()}
        </div>
      </div>
      <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Progress
        </div>
        <div className='font-bold'>
          {((mintInfo.tokensSold / mintInfo.totalSupply) * 100).toFixed(1)}%
        </div>
      </div>
      <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          {mintInfo.isAuctionActive ? 'Auction Ends In' : 'Auction Ended'}
        </div>
        <div className='font-bold'>
          {mintInfo.isAuctionActive ?
            `${Math.floor(mintInfo.timeRemaining / (24 * 60 * 60))}d ${Math.floor((mintInfo.timeRemaining % (24 * 60 * 60)) / (60 * 60))}h` :
            'Completed'
          }
        </div>
      </div>
    </div>
  )
}
