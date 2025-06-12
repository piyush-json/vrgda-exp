import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { CheckIcon, InfoIcon, Copy, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { toast } from 'sonner'

interface SuccessStepProps {
  formData: {
    name: string
    symbol: string
    initialSupply: string
    targetPrice: string
    txUrl: string
    mint: string
  }
  onLaunchAnother?: () => void
}

export function SuccessStep({ formData, onLaunchAnother }: SuccessStepProps) {
  const navigate = useNavigate()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(`${field} copied to clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleLaunchAnother = () => {
    if (onLaunchAnother) {
      onLaunchAnother()
    } else {
      // Fallback: navigate to launch page and refresh
      navigate('/launch-token', { replace: true })
      window.location.reload()
    }
  }

  return (
    <>
      <CardHeader className='text-center'>
        <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
          <CheckIcon className='h-8 w-8 text-green-600 dark:text-green-400' />
        </div>
        <CardTitle className='text-2xl'>Token Successfully Launched!</CardTitle>
        <CardDescription>
          Your VRGDA token auction has been created and deployed on the Solana blockchain
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Token Name</p>
              <p className='font-medium'>{formData.name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Token Symbol</p>
              <p className='font-medium'>{formData.symbol}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Initial Supply</p>
              <p className='font-medium'>
                {parseInt(formData.initialSupply).toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Target Price</p>
              <p className='font-medium'>{formData.targetPrice} SOL</p>
            </div>
          </div>

          {/* Mint Address with copy button */}
          <div className='space-y-2'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Mint Address</p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono'>
                {formData.mint}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formData.mint, 'Mint Address')}
              >
                {copiedField === 'Mint Address' ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Transaction link */}
          <div className='space-y-2'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Transaction</p>
            <a
              href={formData.txUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400 hover:underline'
            >
              View on Solana Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className='space-y-2'>
          <h3 className='font-medium'>Next Steps</h3>
          <ul className='space-y-2'>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-semibold'>
                1
              </div>
              <span>Share your auction link with your community</span>
            </li>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-semibold'>
                2
              </div>
              <span>Monitor your auction's progress in real-time</span>
            </li>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-semibold'>
                3
              </div>
              <span>After the auction ends, claim your proceeds</span>
            </li>
          </ul>
        </div>

        <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
          <InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500' />
          <AlertTitle className='text-blue-800 dark:text-blue-500'>Tip</AlertTitle>
          <AlertDescription className='text-blue-700 dark:text-blue-400'>
            Save your mint address! You'll need it to manage your auction and claim proceeds.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className='flex gap-2 justify-center'>
        <Button variant="outline" onClick={handleLaunchAnother}>
          Launch Another Token
        </Button>
        <Button asChild>
          <Link to={`/token/${formData.mint}`}>
            Go to Token Dashboard
          </Link>
        </Button>
      </CardFooter>
    </>
  )
}
