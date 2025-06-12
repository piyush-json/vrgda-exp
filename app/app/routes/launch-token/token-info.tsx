import React from 'react'
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { HelpCircleIcon, UploadIcon } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface TokenInfoProps {
  formData: any
  validationErrors: { [key: string]: string }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleNextStep: () => void
  canProceed: boolean
}

export function TokenInfo({
  formData,
  validationErrors,
  handleInputChange,
  handleFileChange,
  handleNextStep,
  canProceed
}: TokenInfoProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Token Information</CardTitle>
        <CardDescription>Enter the basic details about your token</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='name' className={validationErrors.name ? 'text-red-600 dark:text-red-400' : ''}>
            Token Name *
          </Label>
          <Input
            id='name'
            name='name'
            placeholder='e.g., Solana Gold'
            value={formData.name}
            onChange={handleInputChange}
            className={validationErrors.name ? 'border-red-300 focus:border-red-500' : ''}
            maxLength={50}
          />
          {validationErrors.name && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.name}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='symbol' className={validationErrors.symbol ? 'text-red-600 dark:text-red-400' : ''}>
            Token Symbol *
          </Label>
          <Input
            id='symbol'
            name='symbol'
            placeholder='e.g., SGLD'
            value={formData.symbol}
            onChange={handleInputChange}
            className={validationErrors.symbol ? 'border-red-300 focus:border-red-500' : ''}
            maxLength={10}
          />
          {validationErrors.symbol ? (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.symbol}</AlertDescription>
            </Alert>
          ) : (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Maximum 10 characters, letters and numbers only
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            name='description'
            placeholder='Describe your token and its purpose...'
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            maxLength={500}
          />
          <p className='text-xs text-gray-500 dark:text-gray-400 text-right'>
            {formData.description.length}/500 characters
          </p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center'>
            <Label htmlFor='initialSupply' className={validationErrors.initialSupply ? 'text-red-600 dark:text-red-400' : ''}>
              Initial Supply *
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='w-80'>
                    The total number of tokens that will be created. This is the maximum supply of your token.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id='initialSupply'
            name='initialSupply'
            type='number'
            placeholder='e.g., 1000000000'
            value={formData.initialSupply}
            onChange={handleInputChange}
            className={validationErrors.initialSupply ? 'border-red-300 focus:border-red-500' : ''}
            min="1"
            max="1000000000000000"
          />
          {validationErrors.initialSupply && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.initialSupply}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='logo'>Token Logo (Optional)</Label>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700'>
              {formData.logo ? (
                <img
                  src={URL.createObjectURL(formData.logo as any)}
                  alt='Token logo preview'
                  className='w-full h-full object-cover'
                />
              ) : (
                <UploadIcon className='h-6 w-6 text-gray-400' />
              )}
            </div>
            <div className='flex-1'>
              <Input
                id='logo'
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
              <Button
                variant='outline'
                onClick={() => document.getElementById('logo')?.click()}
                className='w-full'
                type="button"
              >
                <UploadIcon className='h-4 w-4 mr-2' />
                {formData.logo ? 'Change Logo' : 'Upload Logo'}
              </Button>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                PNG, JPG or SVG, max 5MB, 1:1 ratio recommended
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-end'>
        <Button onClick={handleNextStep} disabled={!canProceed}>
          Continue
        </Button>
      </CardFooter>
    </>
  )
}