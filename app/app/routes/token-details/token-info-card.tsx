import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'

interface TokenInfoCardProps {
  mintInfo: any
  tokenId: string
}

export function TokenInfoCard({ mintInfo, tokenId }: TokenInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Information</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
            Description
          </h3>
          <p className='text-sm'>
            {mintInfo.metadata?.name || `A VRGDA auction token with ${mintInfo.totalSupply.toLocaleString()} total supply. Built on Solana blockchain with variable rate gradual dutch auction mechanism.`}
          </p>
        </div>

        <Separator />

        <div>
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
            Token Details
          </h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-sm'>Token Address</span>
              <span className='text-sm font-mono'>{tokenId?.slice(0, 4)}...{tokenId?.slice(-4)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Decimals</span>
              <span className='text-sm'>{mintInfo.decimals}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Total Supply</span>
              <span className='text-sm'>{mintInfo.totalSupply.toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Target Price</span>
              <span className='text-sm'>{(mintInfo.targetPrice).toFixed(4)} SOL</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
