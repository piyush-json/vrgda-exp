import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { LoaderIcon, ShoppingCartIcon, AlertTriangleIcon, CoinsIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useVRGDA } from '~/hooks/use-vrgda'
import { useWallet } from '@solana/wallet-adapter-react'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface BuyTokenModalProps {
  isOpen: boolean
  onClose: () => void
  tokenName: string
  tokenSymbol: string
  tokenLogo: string
  currentPrice: number
  tokenInfo: VRGDAInfo
  buyAmount: string
  mintAddress: string
  setBuyAmount: (amount: string) => void
  onBuy: (amount: number) => void
  buyStatus: 'idle' | 'loading' | 'success' | 'error'
}

export function BuyTokenModal({
  isOpen,
  onClose,
  tokenName,
  tokenSymbol,
  tokenLogo,
  tokenInfo,
  buyAmount,
  setBuyAmount,
  onBuy,
  buyStatus,
  mintAddress
}: BuyTokenModalProps) {
  const { connected, publicKey } = useWallet()
  const { calculatePrice } = useVRGDA()
  const [localAmount, setLocalAmount] = useState(buyAmount)
  useEffect(() => {
    setLocalAmount(buyAmount)
  }, [buyAmount])

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

  const tokenAmount = parseInt(localAmount) || 0
  const maxPurchase = Math.min(tokenInfo.totalSupply - tokenInfo.tokensSold, 10000000000)

  // Calculate total cost
  const totalCost = tokenAmount > 0 ? Array.from({ length: tokenAmount }, (_, i) => {
    const timePassed = Date.now() / 1000 - tokenInfo.startTime
    return calculatePrice({
      timePassed,
      tokensSold: tokenInfo.tokensSold + i,
      targetPrice: tokenInfo.targetPrice,
      decayConstant: tokenInfo.decayConstant,
      r: tokenInfo.r,
      reservePrice: tokenInfo.reservePrice
    })
  }).reduce((sum, price) => sum + price, 0) : 0

  const averagePrice = tokenAmount > 0 ? totalCost / tokenAmount : 0

  const handleBuy = async () => {
    if (!connected || !publicKey) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue.'
      })
      return
    }

    if (tokenAmount <= 0 || tokenAmount > maxPurchase) {
      toast.error('Invalid amount', {
        description: `Please enter a valid amount between 1 and ${formatNumber(maxPurchase, 0)}.`
      })
      return
    }

    setBuyAmount(localAmount)
    await onBuy(tokenAmount)
  }

  const handleClose = () => {
    // Prevent closing during loading
    if (buyStatus !== 'loading') {
      onClose()
    }
  }

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        {/* Overlay loader when buying */}
        {buyStatus === 'loading' && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-3">
              <LoaderIcon className="h-6 w-6 animate-spin" />
              <span className="text-sm font-medium">Processing transaction...</span>
            </div>
          </div>
        )}

        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              {tokenLogo ? (
                <img
                  src={tokenLogo}
                  alt={tokenName}
                  className='w-10 h-10 rounded-full object-cover'
                />
              ) : (
                <CoinsIcon className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                Purchase {tokenName}
                <Badge variant="secondary">{tokenSymbol}</Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center justify-between">
                <span>Current price: {formatSOL(tokenInfo.currentPrice)} SOL per token</span>
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {mintAddress.slice(0, 8)}...{mintAddress.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(mintAddress, 'Token address')}
                  className="h-5 w-5 p-0"
                >
                  <CopyIcon className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" asChild className="h-5 w-5 p-0">
                  <a
                    href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View in Solana Explorer"
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
            <AlertTriangleIcon className='h-4 w-4 text-blue-600 dark:text-blue-500' />
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              VRGDA pricing: Each token may have a different price based on current demand and time elapsed.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <Label htmlFor='amount' className="flex items-center justify-between">
              <span>Number of Tokens</span>
              <span className="text-xs text-muted-foreground">
                Max: {formatNumber(maxPurchase, 0)}
              </span>
            </Label>
            <Input
              id='amount'
              type='number'
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              placeholder='Enter amount'
              min='1'
              max={maxPurchase.toString()}
              disabled={buyStatus === 'loading'} // Disable input during loading
            />
          </div>

          {tokenAmount > 0 && (
            <div className='space-y-3 rounded-lg border bg-muted/50 p-4'>
              <div className='flex justify-between text-sm'>
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{formatNumber(tokenAmount, 0)} {tokenSymbol}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className="text-muted-foreground">Average Price</span>
                <span className="font-medium">{formatSOL(averagePrice)} SOL</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className="text-muted-foreground">Current Token Price</span>
                <span className="font-medium">{formatSOL(tokenInfo.currentPrice)} SOL</span>
              </div>
              <Separator />
              <div className='flex justify-between font-medium text-base'>
                <span>Total Cost</span>
                <span>{formatSOL(totalCost)} SOL</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={buyStatus === 'loading'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBuy}
            disabled={buyStatus === 'loading' || !connected || tokenAmount <= 0 || tokenAmount > maxPurchase}
            className="min-w-[120px]"
          >
            {buyStatus === 'loading' ? (
              <div className='flex items-center gap-2'>
                <LoaderIcon className='h-4 w-4 animate-spin' />
                <span>Processing...</span>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <ShoppingCartIcon className='h-4 w-4' />
                <span>Buy {tokenSymbol}</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
