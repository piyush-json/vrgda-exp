import React, { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { toast } from 'sonner'
import { useAnchorProvider } from '~/components/solana/solana-provider'

import { useVRGDA } from '~/hooks/use-vrgda'
import { useWallet } from '@solana/wallet-adapter-react'
import type { TokenInfo } from '~/routes/token-details/index'

interface BuyTokenModalProps {
  isOpen: boolean
  onClose: () => void
  tokenName: string
  tokenSymbol: string
  tokenLogo: string
  currentPrice: number
  mintInfo: TokenInfo
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
  currentPrice,
  buyAmount,
  setBuyAmount,
  mintInfo,
  onBuy,
  buyStatus,
  mintAddress
}: BuyTokenModalProps) {
  const { connected, publicKey } = useWallet()
  const provider = useAnchorProvider()
  const { calculatePrice, isLoading } = useVRGDA()
  const [fee, setFee] = useState<'standard' | 'priority'>('standard')

  // Calculate total cost
  const tokenAmount = parseFloat(buyAmount) || 0
  const currentTotalAmount = Array.from({ length: parseInt(buyAmount) || 0 }, (_, i) => i + 1)
    .reduce((total, amount) => total + calculatePrice({
      targetPrice: mintInfo.targetPrice,
      decayConstant: mintInfo.decayConstant,
      r: mintInfo.r,
      timePassed: 0,
      tokensSold: mintInfo.tokensSold + amount,
      reservePrice: mintInfo.reservePrice
    }), 0)
  const subtotal = parseFloat(currentTotalAmount.toFixed(6))
  const total = subtotal

  // Format numbers for display
  const formatNumber = (num: number, decimals: number = 6) => {
    if (num < 0.000001) return num.toExponential(2)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const handleBuy = async () => {
    if (!connected || !provider) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue.'
      })
      return
    }

    if (tokenAmount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid token amount.'
      })
      return
    }

    if (!publicKey) {
      toast.error('WSOL mint not found', {
        description: 'Please check your wallet settings.'
      })
      return
    }

    await onBuy(tokenAmount)
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            {tokenLogo && (
              <img
                src={tokenLogo}
                alt={tokenName}
                className='w-8 h-8 rounded-full'
              />
            )}
            <DialogTitle>Buy {tokenName}</DialogTitle>
          </div>
          <DialogDescription>
            Current price: {formatNumber(currentPrice)} SOL per {tokenSymbol}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='amount' className='text-right'>
              Amount
            </Label>
            <div className='col-span-3 flex gap-2'>
              <Input
                id='amount'
                type='number'
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className='col-span-2'
                placeholder='0.0'
                min='0'
                step='0.1'
              />

              <div className='bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2 flex items-center justify-center'>
                {tokenSymbol}
              </div>
            </div>
          </div>

          {/* <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='fee' className='text-right'>
              Network Fee
            </Label>
            <Select
              value={fee}
              onValueChange={(value) =>
                setFee(value as 'standard' | 'priority')
              }
            >
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select fee' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='standard'>
                  Standard ({formatNumber(feeAmount, 8)} SOL)
                </SelectItem>
                <SelectItem value='priority'>
                  Priority ({formatNumber(feeAmount * 2, 8)} SOL)
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <div className='mt-4 space-y-2 rounded-md bg-gray-50 dark:bg-gray-900 p-3'>
          {/* <div className='flex justify-between text-sm'>
            <span>Subtotal</span>
            <span>{formatNumber(subtotal)} SOL</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span>Network Fee</span>
            <span>{formatNumber(feeAmount, 8)} SOL</span>
          </div> */}
          <div className='border-t border-gray-200 dark:border-gray-700 my-2'></div>
          <div className='flex justify-between font-medium'>
            <span>Total</span>
            <span>{formatNumber(total)} SOL</span>
          </div>
        </div>
        {/* </DialogContent> */}
        {/* <DialogFooter> */}
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleBuy}
          disabled={isLoading || !connected || tokenAmount <= 0}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          {isLoading ? (
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Buy ${tokenSymbol}`
          )}
        </Button>
        {/* </DialogFooter> */}
      </DialogContent>

    </Dialog >
  )
}
