import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { CheckIcon, InfoIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

interface SuccessStepProps {
  formData: {
    name: string
    symbol: string
    initialSupply: string
    targetPrice: string
    txUrl: string
    mint: string
  }
}

export function SuccessStep({ formData }: SuccessStepProps) {
  const navigate = useNavigate()
  return (
    <>
      <CardHeader className='text-center'>
        <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
          <CheckIcon className='h-8 w-8 text-green-600 dark:text-green-400' />
        </div>
        <CardTitle className='text-2xl'>Token Successfully Launched!</CardTitle>
        <CardDescription>
          Your VRGDA token auction has been created and deployed on the Solana
          blockchain
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Token Name
              </p>
              <p className='font-medium'>{formData.name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Token Symbol
              </p>
              <p className='font-medium'>{formData.symbol}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Initial Supply
              </p>
              <p className='font-medium'>
                {parseInt(formData.initialSupply).toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Target Price
              </p>
              <p className='font-medium'>{formData.targetPrice} SOL</p>
            </div>
            <div className='col-span-2'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Transaction
              </p>
              <a
                href={formData.txUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-blue-600 dark:text-blue-400 hover:underline'
              >
                View on Solana Explorer
              </a>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <h3 className='font-medium'>Next Steps</h3>
          <ul className='space-y-2'>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400'>
                1
              </div>
              <span>Share your auction link with your community</span>
            </li>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400'>
                2
              </div>
              <span>Monitor your auction's progress in real-time</span>
            </li>
            <li className='flex items-start'>
              <div className='mr-2 mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400'>
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
            Save your token address and auction details. You'll need these to
            manage your auction and claim proceeds.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className='flex justify-center'>
        <Button onClick={() => {
          navigate(`/token/${formData.mint}`, { replace: true })
        }}>Go to Token Dashboard</Button>
      </CardFooter>
    </>
  )
}
