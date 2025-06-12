import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { CopyIcon, ExternalLinkIcon, InfoIcon, CoinsIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface TokenHeaderProps {
  tokenId: string
  tokenInfo: VRGDAInfo
}

export function TokenHeader({ tokenId, tokenInfo }: TokenHeaderProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className='flex items-center justify-between gap-4 flex-wrap'>
      <div className='flex items-center space-x-4'>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          {tokenInfo.metadata?.uri ? (
            <img
              src={tokenInfo.metadata.uri}
              alt={tokenInfo.metadata?.name || tokenInfo.metadata?.symbol || 'Token'}
              className='w-12 h-12 rounded-full object-cover'
            />
          ) : (
            <CoinsIcon className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
        <div>
          <div className='flex items-center space-x-2 mb-1'>
            <h1 className='text-xl lg:text-2xl font-bold'>
              {tokenInfo.metadata?.name || 'Unknown Token'}
            </h1>
            <Badge variant="secondary" className='uppercase text-xs'>
              {tokenInfo.metadata?.symbol || 'UNK'}
            </Badge>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant="default" className='flex items-center gap-1'>
              <InfoIcon className='h-3 w-3' />
              VRGDA Auction
            </Badge>
            <Badge variant={tokenInfo.isAuctionActive ? "default" : "secondary"}>
              {tokenInfo.isAuctionActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => copyToClipboard(tokenId, 'Token address')}
        >
          <CopyIcon className='h-4 w-4 mr-2' />
          Copy
        </Button>
        <Button variant='outline' size='sm' asChild>
          <a
            href={`https://explorer.solana.com/address/${tokenId}?cluster=devnet`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <ExternalLinkIcon className='h-4 w-4 mr-2' />
            Explorer
          </a>
        </Button>
      </div>
    </div>
  )
}
