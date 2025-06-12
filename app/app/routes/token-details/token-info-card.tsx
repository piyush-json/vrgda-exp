import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface TokenInfoCardProps {
  tokenInfo: VRGDAInfo
  tokenId: string
}

export function TokenInfoCard({ tokenInfo, tokenId }: TokenInfoCardProps) {
  const formatNumber = (num: number, decimals: number = 6) => {
    if (num < 0.000001) return num.toExponential(2)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const formatSOL = (lamports: number) => {
    return formatNumber(lamports / 1e9, 4)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Address copied to clipboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Token Information
          <Badge variant="outline">VRGDA</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {tokenInfo.metadata?.name && (
          <>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Description
              </h3>
              <p className='text-sm'>
                {tokenInfo.metadata.name} is a VRGDA (Variable Rate Gradual Dutch Auction) token with {formatNumber(tokenInfo.totalSupply, 0)} total supply. Built on the Solana blockchain with dynamic pricing mechanisms.
              </p>
            </div>
            <Separator />
          </>
        )}

        <div>
          <h3 className='text-sm font-medium text-muted-foreground mb-3'>
            Contract Details
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Token Address</span>
              <div className="flex items-center gap-2">
                <span className='text-sm font-mono'>
                  {tokenId.slice(0, 8)}...{tokenId.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tokenInfo.mintAddress)}
                  className="h-6 w-6 p-0"
                >
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Total Supply</span>
              <span className='text-sm font-medium'>{formatNumber(tokenInfo.totalSupply, 0)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Tokens Sold</span>
              <span className='text-sm font-medium'>{formatNumber(tokenInfo.tokensSold, 0)}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className='text-sm font-medium text-muted-foreground mb-3'>
            VRGDA Parameters
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm'>Target Price</span>
              <span className='text-sm font-medium'>{formatSOL(tokenInfo.targetPrice)} SOL</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Reserve Price</span>
              <span className='text-sm font-medium'>{formatSOL(tokenInfo.reservePrice)} SOL</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Decay Constant</span>
              <span className='text-sm font-medium'>{tokenInfo.decayConstant.toFixed(4)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>R Parameter</span>
              <span className='text-sm font-medium'>{tokenInfo.r.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
