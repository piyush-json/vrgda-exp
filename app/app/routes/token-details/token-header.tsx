import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { CopyIcon, ExternalLinkIcon, InfoIcon } from 'lucide-react'

interface TokenHeaderProps {
  tokenId: string
  mintInfo: any
}

export function TokenHeader({ tokenId, mintInfo }: TokenHeaderProps) {
  return (
    <div className='flex items-center justify-between gap-2 max-md:flex-col'>
      <div className='flex items-center space-x-4'>
        <Avatar className='h-12 w-12 rounded-full'>
          <img
            src={mintInfo.metadata?.uri || '/default-token-logo.png'}
            alt={mintInfo.metadata?.name || mintInfo.symbol}
            className='object-cover'
          />
        </Avatar>
        <div>
          <div className='flex items-center space-x-2'>
            <h1 className='text-xl lg:text-2xl font-bold'>
              {mintInfo.metadata?.name || mintInfo.symbol}
            </h1>
            <Badge className='uppercase'>{mintInfo.symbol}</Badge>
          </div>
          <div className='flex items-center space-x-2 mt-1'>
            <Badge
              variant='default'
              className='flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            >
              <InfoIcon className='h-3 w-3 mr-1' />
              VRGDA Auction
            </Badge>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {mintInfo.isAuctionActive ? 'Active' : 'Ended'}
            </span>
          </div>
        </div>
      </div>
      <div className='flex md:flex-col gap-2'>
        <Button variant='outline' size='sm' onClick={() => navigator.clipboard.writeText(tokenId || '')}>
          <CopyIcon className='h-4 w-4 mr-2' />
          Copy Address
        </Button>
        <Button variant='outline' size='sm' asChild>
          <a href={`https://explorer.solana.com/address/${tokenId}?cluster=devnet`} target='_blank' rel='noopener noreferrer'>
            <ExternalLinkIcon className='h-4 w-4 mr-2' />
            Explorer
          </a>
        </Button>
      </div>
    </div>
  )
}
